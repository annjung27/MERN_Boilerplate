const express = require('express')
const app = express()
const port = 8000
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const config = require('./config/key');
const { User } = require("./models/User");
const { auth } = require('./middleware/auth');

// middleware / 사용자가 입력한 정보를 중간에서 분석해서 서버로 가져다 주는 역할
app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//------------------- connecting MongoDB -------------------------
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(()=> console.log('MongoDB Connected...'))
    .catch(err => console.log(err))




// --------------------------Register Routes ----------------------------------
app.get('/', (req, res) =>  res.send('안녕하세요!'))


app.get('/api/hello', (req, res)=> {
    res.send("Hello API 에서 보내는 메시지다!!! axios 테스트 성공!")
})



app.post('/api/users/register', (req, res) => {
  // 회원가입 할때 필요한 정보들을 client 에서 가져오면
  // 그것을 데이터 베이스에 넣어준다.

    const user = new User(req.body)

    user.save((err, userInfo) => {
    if(err) return res.json({ success: false, err})
    return res.status(200).json({
        success: true
        })
    })
})




// ----------------Login Route-------------------------------------

app.post('/api/users/login', (req, res) => {
  // 요청된 이메일ㅇ르 데이터베이스에 있는지 찾음.
    User.findOne({ email: req.body.email }, (err, user) => {
    if(!user) {
        return res.json({
        loginSuccess: false, 
        message: "Email not found"
        })
    }

    // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 확인.
    user.comparePassword(req.body.password, (err, isMatch)=> {
        if(!isMatch)
            return res.json({ loginSuccess: false, message: "Incorrect Password"})

      // 비밀번호가 맞으면 토큰을 생성.
        user.generateToken((err, user) => {
        if(err) return res.status(400).send(err);
        console.log(err);
      // 토큰을 저장한다. -> 쿠키
        res.cookie("x_auth",  user.token )
        .status(200)
        .json({ loginSuccess: true, userId:user._id })

            })
        })
    })    
})

// -------Authentication Route----------------------
app.get('/api/users/auth', auth , (req, res)=> {

    // 여기까지 미들웨어를 통과해서 왔다는 것은  Authentication이 True라는 말.
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role = 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

// ------Logout Route ------------------------------

app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({_id: req.user._id},
    {token: ""},
    (err, user) => {
        if(err) return res.json({ success: false, err});
        return res.status(200).send({
        success: true
        })
    })

})








app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})