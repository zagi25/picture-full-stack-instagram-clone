import {useState, useEffect, useRef} from 'react';
import { useGlobalContext } from './../context';
import { Link, useNavigate } from 'react-router-dom';
import {fetch_data } from './../functions';
import Compressor from 'compressorjs';

const Signup = () => {
  const { serverUrl , setToken , setIsLogged } = useGlobalContext();

  const [user, setUser] = useState({
    username:'',
    password:'',
    img:''
  });//User info
  const [picture, setPicture] = useState({
    pictureAsFile: '', 
    picturePreview: '', 
  });//Profile picutre

  const navigate = useNavigate();

  const imgRef1 = useRef();//Profile image

  //Regex for checking username => username must be at least 3 characters long, max 25 characters long and can't contain special characters except "_"
  const checkUsername = (username) => {
    const regex = /^\w{3,25}$/g;
    const res = regex.test(username);
    return res;
  }

  const changeUsername = (e) => {
    e.preventDefault();
    setUser({...user, username: e.target.value});
  }

  //Regex for checking password => password must be at least 8 characters long , max 25 characters long and must have at least 2 numbers and can't have 
  //special characters
  const checkPassword = (password) => {
    const regex = /^(?=(?:\D*\d){2})[a-zA-Z0-9]{8,25}$/g;
    const res = regex.test(password);
    return res;
  }

  const changePassword = (e) => {
    e.preventDefault();
    setUser({...user, password: e.target.value});
  }

  //Check if file is image
  const checkImage = (picture) => {
    const isImage = picture.type.split('/');
    if(isImage[0] === 'image'){
      return true;
    }else{
      return false;
    }
  }

  const uploadPicture = (e) => {
    e.preventDefault();
    e.preventDefault();
    const image = e.target.files[0];
    //Compressing image
    new Compressor(image, {
      quality: 0.6,
      success: (compressedImage) => {
        setPicture({
          pictureAsFile: compressedImage,
          picturePreview: URL.createObjectURL(compressedImage),
        });
      }
    });
  }

  useEffect(() => {
    //Open image file and turn image data into base64 encoded string
    const encodeImageFileAsURL = () => {
      var reader = new FileReader();
      reader.onloadend = function() {
        setUser((prev) => ({...prev, img: reader.result}));
      }
      reader.readAsDataURL(picture.pictureAsFile);
    }

    if(picture.pictureAsFile){
      encodeImageFileAsURL();
    }
  }, [picture])

  //Checking signup data
  const sendData = (e) =>{
    e.preventDefault();
    if (!user.username){
      alert('Please enter username!');
    }else if(!user.password){
      alert('Please enter password!');
    }else if(!user.img){
      alert('Please upload profile picture!');
    }else{
      if(!checkUsername(user.username)){
        alert('Username must be 3-25 characters long and can\'t contain any special characters except "_"!');
      }else if(!checkPassword(user.password)){
        alert('Password must be 8-25 characters long, must contain at least 2 numbers and can\'t contain any special characters!'); 
      }else if(!checkImage(picture.pictureAsFile)){
        alert('Please upload image file!');
      }else{
        signup();
      }
    }
  }

  const signup = async() => {
    const response = fetch_data(
      serverUrl+'users', 
      'POST', 
      {}, 
      'application/json', 
      user,
    );
    const [status, recived_data] = await response;
    if(status === 201){
      const token1 = recived_data;
      if(token1){
        sessionStorage.setItem('token', token1);
        setToken(token1);
        setIsLogged(true);
        navigate('/', { replace:true });
      }
    }else {
      alert('Username is taken!');
    }
  }

  //Fitting image
  const imageFit= () => {
    const imgHeight = imgRef1.current.naturalHeight;
    const imgWidth = imgRef1.current.naturalWidth;
    
    if(imgHeight >= imgWidth){
      imgRef1.current.style['object-fit'] = 'fill';
    }else {
      imgRef1.current.style['object-fit'] = 'cover';
    }
  }


  return (
    <div className = 'signup'>
      <div className='signlog-logo-container'>
        <div className='signlog-logo'>
          <img src="logo.png" alt="" />
        </div>
        <h1>PICTURE</h1>
      </div>
      <form className='signlog-form' onSubmit = {sendData}>
        <div className = 'signup-img-container'>
          {picture.picturePreview ? 
            <img ref = {imgRef1} onLoad={imageFit} src={picture.picturePreview} className = 'signup-img' alt="profile_pcture" />
          :
            <img className = 'signup-img' src = 'default_profile_picture.jpeg' alt = '' />
          }
        </div>
        <label  className='upload-img btn' htmlFor = 'profile_picture'>
          Upload profile image
        </label>
        <input className='signup-upload' type='file' id='profile_picture' onChange={uploadPicture} />
        <label className='signlog-label-username' htmlFor='username'>Username:</label>
        <input className='text-input signlog-username' type='text' id='username' value={user['username']} onChange={changeUsername} />
        <label className='signlog-label-password' htmlFor='pass'>Password:</label>
        <input className = 'text-input signlog-password' type='password' id='pass' value={user['password']} onChange={changePassword} />
        <button className = 'signlog-btn btn' type='submit'>Create User</button>
        <p className='signlog-link'>Have an account? <Link to='/'>Log In.</Link></p>
      </form>
    </div>
  );
}

export default Signup;
