import React, { useEffect } from 'react';
import axios from 'axios';

function LandingPage(props) {

    useEffect(() => {
        axios.get('http://localhost:8000/api/hello')
        .then(response => console.log(response.data))
    }, [])

    const onClickHandler = () => {
        axios.get('http://localhost:8000/api/users/logout')
          .then(response => {
            if(response.data.success) {
              props.history.push('/login')
            } else {
              alert("Logout failed")
            }
          })
      }



  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      width: '100%', height: '100vh'
    }}>
        <h1>랜딩페이지</h1>

        <button onClick={onClickHandler} >
          Logout
        </button>
    </div>
  )
}

export default LandingPage