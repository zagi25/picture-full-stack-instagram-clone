import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetch_data } from './../functions';
import { useGlobalContext } from './../context';
import Compressor from 'compressorjs';

const PostImage = () => {
  const { token, serverUrl, loggedUser, setTitle } = useGlobalContext();

  const [picture, setPicture] = useState({
    pictureAsFile: '',
    picturePreview:'', 
  });
  const [imgPreview, setImgPreview] = useState('');
  const [imgFilter, setImgFilter] = useState('none');
  const [imgData, setImgData] = useState({
    desc: '', 
    img: '',
  })
  const [sending, setSending] = useState(false);

  const navigate = useNavigate();

  const imgRef = useRef();
  const canRef = useRef();//Canvas ref


  useEffect(() => {
    setTitle(`Picture - post image`);
  },[]);
  
  //Open image file and turn image data into base64 encoded string and change image depending on active filter
  useEffect(() => {
    const encodeImageFileAsURL = () => {
      var reader = new FileReader();
      reader.onloadend = function() {
        if(imgFilter === 'none'){
          setImgPreview(reader.result);
          setImgData((prev) => ({...prev, img: reader.result}));
        }else{
          // blackWhite(reader.result);
        }
      }
      reader.readAsDataURL(picture.pictureAsFile);
    }
    if(picture.pictureAsFile){
      encodeImageFileAsURL();
    }
  }, [picture, imgFilter])

  ////Black and white filter(adds size to image need to fix that)
  //const blackWhite = (img) => {
  //  var myImage = new Image();
  //  myImage.src = img;
  //  myImage.onload = (e) => {
  //    canRef.current.height = myImage.height;
  //    canRef.current.width = myImage.width;
  //    console.log(myImage.src.length * 3/4);
  //    var context = canRef.current.getContext('2d');
  //    console.log(context);
  //    context.drawImage(myImage, 0, 0);
  //    var pixels = context.getImageData(0, 0, myImage.width, myImage.height);
  //    // console.log(pixels.data.length);
  //    ////Changing pixels values of image
  //    //for(let i = 0; i < pixels.data.length; i+= 4){
  //    //  //Every pixel becomes average value of R, G and B
  //    //  //pixels.data[i] => R
  //    //  //pixels.data[i+1] => G
  //    //  //pixels.data[i+2] => B
  //    //  //pixels.data[i+3] => alpha
  //    //  let color = (pixels.data[i] + pixels.data[i+1] + pixels.data[i+2])/3;
  //    //  pixels.data[i] = color;
  //    //  pixels.data[i+1] = color;
  //    //  pixels.data[i+2] = color;
  //    //  pixels.data[i+3] = 255;
  //    //}
  //    context.putImageData(pixels, 0, 0);
  //    var image = canRef.current.toDataURL();//Turning image to base64 enocoded string
  //    console.log(image.length * 3/4);
  //    setImgPreview(image);
  //    setImgData((prev) => ({...prev, img: image}));
  //  }
  //}

  const imageFit = () => {
    const imgHeight = imgRef.current.naturalHeight;
    const imgWidth = imgRef.current.naturalWidth;
    
    if(imgHeight >= imgWidth){
      imgRef.current.style['object-fit'] = 'fill';
    }else {
      imgRef.current.style['object-fit'] = 'contain';
    }
  }

  const uploadImage = (e) => {
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
        setImgPreview(URL.createObjectURL(compressedImage));
      }
    });
  }

  const handleDesc = (e) => {
    setImgData({
      ...imgData,
      desc: e.target.value,
    })
  }

  const checkImage = (picture) => {
    const isImage = picture.type.split('/');
    if(isImage[0] === 'image'){
      return true;
    }else{
      return false;
    }
  }

  const sendData = (e) => {
    e.preventDefault();
    if(!imgData.img){
      alert('Please upload image!')
    }else{
      if(!checkImage(picture.pictureAsFile)){
        alert('Please upload image file!');
      }else{
        setSending(true);
        send();
      }
    }
  }

  const send = async() => {
    const data = [{token:token}, imgData];
    const response = fetch_data(
      serverUrl+'image',
      'POST',
      {},
      'application/json',
      data,
    );
    const [status] = await response;
    if(status === 200){
      navigate(`/${loggedUser.username}`);
    }
  }


  return (
    <div className='post-container'>
      <div className='post-img-container'>
        {picture.picturePreview ? 
          !sending ? 
            <img ref={imgRef}  onLoad = { imageFit } className = 'post-img' src = {imgPreview} alt = '' />
            :
            <>
              <img ref={imgRef}  onLoad = { imageFit } className = 'post-img' src = {imgPreview} alt = '' />
              <div className = 'loading-div'>
                <img src = 'loading3.png' alt='' />
              </div>
            </>
          :
          <img className = 'post-img' src = 'default_profile_picture.jpeg' alt = '' />
        }
      </div>
      <form className='post-form' onSubmit = {sendData} >
        <label className= 'btn post-btn' htmlFor='new_img'>
          Upload photo
        </label>
        <input className= 'post-upload' type='file' id = 'new_img' onChange = {uploadImage} />
        <label className = 'post-label' htmlFor = 'post_desc'>Description: </label>
        <textarea className = 'post-desc' id='post_desc' rows = '4' cols = '30' value={imgData.desc}  onChange = {handleDesc}></textarea>
        {/* {picture.picturePreview && */}
        {/*   <div className='post-filters'> */}
        {/*     <p>Filters:</p> */}
        {/*     <button type='button' className={imgFilter === 'none' ? 'btn btn-filter btn-filter-active': 'btn btn-filter'} onClick = {() => setImgFilter('none')}>None</button> */}
        {/*     <button type='button' className={imgFilter === 'black' ? 'btn btn-filter btn-filter-active': 'btn btn-filter'} onClick = {() => setImgFilter('black')}>Black and White</button> */}
        {/*   </div> */}
        {/* } */}
        {!sending ? 
          <button  type='submit' className='btn post-submit-image'>Add photo</button>
          :
          <button type='button' className='btn post-submit-image'>Add photo</button>
        }
      </form>
      <canvas style={{display: 'none'}} ref={canRef} id='myCanvas' width='1000' height='700'></canvas>
    </div>
  );
}

export default PostImage;
