import { useState, useRef } from 'react';
import { useGlobalContext } from './../context';
import { Link , useNavigate } from 'react-router-dom';
import { fetch_data } from './../functions';

const Login = () => {
  const { setToken, serverUrl, setIsLogged, sendPoll, setSendPoll } = useGlobalContext();

  const [user, setUser] = useState({
    username:'',
    password:''
  });

  const navigate = useNavigate();

  const userNameRef = useRef();//Username input
  
  const changeUsername = (e) => {
    e.preventDefault();
    setUser({...user, username: e.target.value});
  }

  const changePassword = (e) => {
    e.preventDefault();
    setUser({...user, password: e.target.value});
  }

  const sendData = (e) =>{
    e.preventDefault();
    login();
  }

  const login = async() => {
    const response = fetch_data(
      serverUrl+'login',
      'POST', 
      {},
      'application/json',
      user,
    );
    const [status, recived_data] = await response;
    if(status === 200){
      const token1 = recived_data;
      if(token1){
        //Setting token
        sessionStorage.setItem('token', token1);
        setToken(token1);
        setIsLogged(true);
        setSendPoll(!sendPoll);
        navigate('/', { replace:true });
      }
    }else if(status === 401){
      alert('Wrong username or password!');
      setUser({
        username: '',
        password: '',
      });
      userNameRef.current.focus();
    }
  }

  return (
    <div className = 'login'>
      <div className='signlog-logo-container'>
        <div className='signlog-logo'>
          <img src="logo.png" alt="" />
        </div>
        <h1>PICTURE</h1>
      </div>
      <form className='signlog-form' onSubmit = {sendData} >
        <label className='signlog-label-username' htmlFor='username'>Username:</label>
        <input ref={ userNameRef } className = 'text-input signlog-username' type='text' id='username' value={user['username']} onChange={(e) => changeUsername(e)}/>
        <label className=' signlog-label-password' htmlFor='pass'>Password:</label>
        <input className = 'text-input signlog-password' type='password' id='pass' value={user['password']} onChange={changePassword} />
        <button className = 'signlog-btn btn' type='submit' >Login</button>
        <p className='signlog-link' >Don't have an account? <Link to='/signup'>Sign up.</Link></p>
      </form>
    </div>
  );
}

export default Login;
