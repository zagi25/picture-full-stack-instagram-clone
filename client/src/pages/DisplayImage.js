import { useEffect, useState } from 'react';
import { useParams , useNavigate} from 'react-router-dom';
import { useGlobalContext } from './../context';
import Post from './../components/Post';
import { fetch_data } from './../functions';

//Can't load logo and loading image on this page don't know why
const DisplayImage = () => {
  const { token, serverUrl, setTitle } = useGlobalContext();

  const [image, setImage] = useState([]);
  const [imgId, setImgId] = useState(window.location.href);
  const [imgLoad, setImgLoad] = useState(true);

  const navigate = useNavigate();

  const params = useParams();//Params from clicked image

  //Returning image path in DB
  const what_img = (img) => {
    const id = img.split('_');
    return [`images/${id[0]}/images/${img}`, id[0]];
  }

  const deletePost = (post_id, image_path) => {
    navigate(`/${image[0].username}`);
    send_delete_img(post_id, image_path);
  }

  const send_delete_img = async(id, path) => {
    const data = [{token:token}, {post_id: id, image_path: path}];
    fetch_data(
      serverUrl + 'image',
      'DELETE',
      {},
      'application/json',
      data,
    );
  }

  useEffect(() => {
    setImgId(window.location.href);
  },[params]);

  useEffect(() => {
    const get_image = async() => {
      const data =[{token:token},  what_img(params.image)];
      const response = fetch_data(
        serverUrl + 'oneimage',
        'POST',
        {},
        'application/json',
        data,
      );
      const [status, recived_data] = await response;
      if(status === 200){
        setImage(recived_data);
        setTitle(`Picture - images/${params.image}`);
        setImgLoad(false);
      }else{
        setImage([]);
        setImgLoad(false);
      }
    }
    get_image();
  },[imgId, serverUrl]);


  return (
    <div className='home-profile'>
      {!imgLoad ? 
        image.length > 0 ?
          <Post array={image} image={image[0]} deletePost = {deletePost}  />
          :
          <div className='no-post'>
            <h1>Post not found!</h1>
          </div>
        :
        <div className='loading-div'><img src='loading2.png' alt='' /></div>
      }
    </div>
  );
}

export default DisplayImage;
