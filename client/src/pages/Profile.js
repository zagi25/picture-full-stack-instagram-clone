import { useEffect, useState, useRef } from 'react';
import { useParams , useNavigate, Link } from 'react-router-dom';
import { useGlobalContext } from './../context';
import { fetch_data } from './../functions';
import Post from './../components/Post';

const Profile = () => {
  const { token, serverUrl, loggedUser, setTitle } = useGlobalContext();

  const [images, setImages] = useState([]);
  const [username, setUsername] = useState(window.location.href);
  const [user, setUser] = useState({
    user_id:'',
    username: '', 
    img: '', 
    follow_status:'',
    followers:'',
    following:'',
  });
  const [followBtn, setFollowBtn] = useState('');
  const [loadingImg, setLoadingImg] = useState(true);
  const [loading, setLoading] = useState(true);
  const [noUser, setNoUser] = useState(false);
  const [moreImg, setMoreImg] = useState(false);
  const [numImg, setNumImg] = useState(10);//Number of images to fetch
  const [fetchingNewImg, setFetchingNewImg] = useState(false);
  const [noMore, setNoMore] = useState(false);//No more images to fetch

  const params = useParams();//Username of user

  const imgRef = useRef();
  const scrollRef = useRef();

  const navigate = useNavigate();


  useEffect(() => {
    setTitle(`Picture - ${user.username}`);
  },[user]);

  //Follow button 
  useEffect(() => {
    const follow_btn = () => {
      if(user.follow_status === 'request_sent'){
        setFollowBtn('Request sent');

      }else if(user.follow_status === 'request_recived' || user.follow_status === 'request_recivedF'){
        //request_recivedF => recived request and following user
        setFollowBtn('Accept request');

      }else if(user.follow_status === 'following' || user.follow_status === 'followingF'){
        //followingF => following each other
        setFollowBtn('Following');

      }else if(user.follow_status === 'follow_back'){
        setFollowBtn('Follow back');

      }else{
        setFollowBtn('Follow');
      }
    }

    if(user){
      follow_btn();
    }
  },[user]);

  //Change follow status 
  const handleFollow = () => {
    let follow_data = {
      follower: loggedUser.user_id,
      followed: user.user_id,
      follow_status: '',
    }

    //Cancel follow request
    if(user.follow_status === 'request_sent'){
      follow_data.follow_status = '';
      setUser({...user, follow_status: ''});

    //If recived request change status to following
    }else if(user.follow_status === 'request_recived' || user.follow_status === 'request_recivedF'){
      follow_data = {
        follower: user.user_id,
        followed: loggedUser.user_id, 
        follow_status: 'following',
      }
      //If start following increase number of followers
      user.follow_status ===  'request_recived' ? 
        setUser((prev) => 
          ({...prev, follow_status:'follow_back', following: prev.following + 1}))
      :
        setUser((prev) => 
          ({...prev, follow_status:'following', following: prev.following + 1}));

    //Send request
    }else if(!user.follow_status || user.follow_status === 'follow_back'){
      follow_data.follow_status = 'request_sent';
      setUser({...user, follow_status: 'request_sent'});

    //Stop following
    }else if(user.follow_status === 'following' || user.follow_status === 'followingF'){
      follow_data.follow_status = '';
      //If stop following reduce number of followers
      setUser((prev) => 
        ({...prev, follow_status:'', followers: prev.followers - 1}))

      setImages([]);//If stop following remove all images
    }
    send_follow(follow_data);
  }

  const send_follow = async(follow_data) => {
    const data = [{token: token}, follow_data];
    fetch_data(
      serverUrl + 'follow',
      'POST',
      {},
      'application/json',
      data,
    );
  }

  const get_images = async() => {
    const data = [{token:token}, [params, {numImg: 0}]];
    const response = fetch_data(
      serverUrl + 'profile',
      'POST', 
      {}, 
      'applications/json',
      data,
    );
    const [status, recived_data] = await response;
    if(status === 200){
      setImages(recived_data);
      setLoadingImg(false);
      recived_data.length < 10 && setNoMore(true);
      document.documentElement.scrollTop = 0;//Scroll to top after loading images
    }
  }

  //Lazy loading
  const get_more_images = async() => {
    const data = [{token:token}, [params, {numImg: numImg}]];
    const response = fetch_data(
      serverUrl + 'profile',
      'POST', 
      {}, 
      'applications/json',
      data,
    );
    const [status, recived_data] = await response;
    if(status === 200){
      setImages((prev) => [...prev, ...recived_data]);
      setNumImg((prev) => prev + 10);
      setFetchingNewImg(false);
      recived_data.length < 10 && setNoMore(true);
    }
  }

  const get_user = async() => {
    const data = [{token:token}, params];
    const response = fetch_data(
      serverUrl + 'get_user',
      'POST',
      {},
      'application/json',
      data,
    );
    const [status, recived_data] = await response;
    if(status === 200){
      if(recived_data.length > 0){
        setUser({
          user_id: recived_data[0].user_id,
          username: recived_data[0].username,
          img: recived_data[0].profile_picture,
          follow_status: recived_data[0].follow_status,
          followers: recived_data[0].followers,
          following: recived_data[0].following,
        });
      }else{
        setNoUser('true');
      }
    }
    setLoading(false);
  }

  //Using this because when changing params it renders more than one time 
  useEffect(() => {
    setUsername(window.location.href);
  },[params]);
  
  useEffect(() => {
    setLoading(true);
    setLoadingImg(true);
    get_images();
    get_user();
    setNumImg(10);//Returning number of images to 20 when changing user profile
  },[username]);

  //Lazy loading
  useEffect(() => {
    if(!noMore && moreImg){
      setFetchingNewImg(true);
      get_more_images();
    }
  },[moreImg]);

  //Deleting image
  const deletePost = (post_id, image_path) => {
    let res = images.filter((image) => image.post_id !== post_id );
    setImages(res);
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

  const imageFit = () => {
    const imgHeight = imgRef.current.naturalHeight;
    const imgWidth = imgRef.current.naturalWidth;
    
    if(imgHeight >= imgWidth){
      imgRef.current.style['object-fit'] = 'fill';
    }else {
      imgRef.current.style['object-fit'] = 'cover';
    }
  }


  return (
    <div className='home-profile'>
      <div ref={scrollRef}></div>
      {!loading ? 
        !noUser ? 
          <div className={user.follow_status !== 'following' && user.follow_status !== 'followingF'  && user.follow_status !== 'same' && user.follow_status !== 'request_recivedF' ?
              'profile-user profile-user-no' 
              :
              'profile-user'}
          >
            <div className='profile-user-img' >
              <img ref={imgRef} src={serverUrl + user.img} alt=''   onLoad={imageFit} />
            </div>
            <div className='profile-user-info'>
              <h1>{user.username}</h1>
              <div className='profile-user-numbers'>
                <div className='profile-user-followers'>
                  <p>followers</p>
                  <p>{user.followers}</p>
                </div>
                <div className='profile-user-followers' >
                  <p>following</p>
                  <p>{user.following}</p>
                </div>
              </div>
              {user.user_id !== loggedUser.user_id ?
                <div>
                  <button className='btn follow-btn' onClick = {handleFollow}>{followBtn}</button>
                  {user.follow_status === 'followingF' &&
                    <button className='btn follow-btn msg-btn' 
                    onClick={() => navigate('/messages', {state:{
                      user_id: user.user_id,
                      username: user.username,
                      profile_picture: user.img,
                      }})} 
                    >
                    Send Message
                    </button>
                  }
                </div>

                :
                <div></div>

              }
            </div>
          </div>
          :
          <div className='no-user'>
            <h1>User not found</h1>
          </div>
        :
        <div></div>
      }
      {!loading?
        !noUser ? 
          !loadingImg ? 
            images.length > 0 ? 
              images.map((image,i, array) => <Post setMoreImg={setMoreImg} image={image} deletePost={deletePost} array={array} index={i} key={i} /> )
              :
              user.user_id === loggedUser.user_id ? 
                <div className='no-post'>
                  <p>You haven't posted any images yet. <Link to = '/post_image'>Post image</Link>?</p>
                </div>
                :
                <div className='no-post'>
                  <p>No posts to show.</p>
                </div>
            :
            <div className='loading-div'></div>
          :
          <div></div>
          :
          <div className='loading-div'><img src='loading2.png' alt=''/></div>

          }
      {fetchingNewImg && !noMore ? <div><img src='loading3.png' alt='' /></div> : <div></div>}
    </div>
  );
}

export default Profile;
