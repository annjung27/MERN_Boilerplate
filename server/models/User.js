const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, 
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    }, 
    tokenExp: {
        type: Number
    }
})

// ----------- bcrypt로 비밀번호 암호화하기 --------------------------------------
    // 비밀번호를 save 하기전(pre)에 비밀번호를 암호화해줌.
userSchema.pre('save', function( next ){
    var user = this;
    // if문을 사용해서  비밀번호 부분이 modified 될 경우에만 비밀번호를 암호화 시키도록함. 
    if(user.isModified('password')){
        //salt를 생성하고 salt를 이용해서 비밀번호를 암호화 시킴.
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err)

            bcrypt.hash(user.password , salt, function(err, hash){
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
    
})

// -----------Login - 암호매치 확인 및 jwt로 토큰생성----------------------------

userSchema.methods.comparePassword = function(plainPassword, cb){
    // plainpassword와 데이터베이스에 있는 암호화된 비밀번호가 같은지 체크. 
    //  plainpassword를 암호화 해서 비교.
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb) {

    var user = this;
    // jsonwebtoken을 이용해서 토큰 생성.
    var token = jwt.sign(user._id.toHexString(), 'secretToken')

    user.token = token
    user.save(function(err, user){
        if(err) return cb(err);
        cb(null, user)
    })
}

userSchema.statics.findByToken = function( token, cb){
    var user = this;

    // 토큰을 가져와서 decode 함
    jwt.verify(token, 'secretToken', function(err, decoded) {
        // userid를 이용해서 유저를 찾은 다음이
        // 클라이언트에서 가져온 토큰과 데이터베이스에 있는 토큰이 일치하는지 확인. 

        user.findOne({"_id": decoded, "token": token}, function(err, user){
            if(err) return cb(err);
            cb(null, user)
        })
    })
}

const User = mongoose.model('User', userSchema)

module.exports = { User }