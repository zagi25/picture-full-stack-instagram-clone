import { useRef , useState, useEffect } from 'react';
import { useGlobalContext } from './../context';
import { useNavigate } from 'react-router-dom';
import { fetch_data } from './../functions';
import { AiFillHeart,  AiOutlineHeart, AiOutlineComment, AiOutlineSend, AiOutlineDown, AiOutlineDelete } from 'react-icons/ai';
import moment from 'moment';

const Post = ({ image, index, array, deletePost, setMoreImg }) => {
  const { serverUrl, loggedUser, isComment, setIsComment, token } = useGlobalContext();

  const [likeInfo, setLikeInfo] = useState({
    user_id: '',
    post_id: '',
    type: '',
    reciver: '', 
  });//Like info for sending to server
  const [like, setLike] = useState();//Set true if logged user liked post 
  const [comment, setComment] = useState({
    content:'',
    user_id:'',
    post_id:'', 
    type:'',  
    reciver: '',
  });//Comment info for sending to server
  const [comments, setComments] = useState(image.comments.slice(0,3));//Show just 3 comments
  const [allComments, setAllComments] = useState(image.comments);//All comments
  const [numLikes, setNumLikes] = useState(image.likes.length);//Number of likes
  const [addComment, setAddComment] = useState(false);//Show comment input
  const [showComments, setShowComments ] = useState(false);//Show all comments
  const [loadOwner, setLoadOwner] = useState(true);
  const [clickedMore, setClickedMore] = useState(false);//Clicked a button for post options

  const navigate = useNavigate();

  const imgRef = useRef();
  const imgRef1 = useRef();
  const inputRef = useRef();//Ref for textarea
  const commRef = useRef();//Ref for comments
  const delRef = useRef();//Ref for delete post button
  const obsRef = useRef();//Ref for observing


  //Event listener for clicking outside  delete button
  useEffect(() => {
    document.addEventListener('mousedown', handleClickD);

    return () => {
      document.removeEventListener('mousedown', handleClickD);
    };
  },[]);

  const handleClickD = (e) => {
    if(delRef.current){
      if(delRef.current.contains(e.target)) {
        return;
      }else{
        setClickedMore(false);
      }
    }
  }

  //If navigating from notifications click and notification type is comment scroll to comments
  useEffect(() => {
    if(isComment){
      commRef.current.scrollIntoView();
      setIsComment(false);
    }
  },[image]);

  //Set like info and comment info according to logged user and post information
  useEffect(() => {
    setLikeInfo({
      user_id: loggedUser.user_id,
      post_id: image.post_id,
      type: 'like',
      reciver: image.user_id, 
    });
    setComment({
      comment_id:'new',
      content:'',
      user_id: loggedUser.user_id,
      post_id: image.post_id,
      type: 'comment',
      reciver:image.user_id,
    });
    setAllComments(image.comments);
    setComments(image.comments.slice(0,3));
  },[loggedUser,image]);

  //Checking if post is liked by logged user or not
  useEffect(() => {
    if(image.likes.find((like) => like === loggedUser.user_id)){
      setLike(true);
    }else{
      setLike(false);
    }
    setNumLikes(image.likes.length);
  },[loggedUser, image ]);

  const send_like = async() => {
    const data = [{token:token}, likeInfo];
    const response = fetch_data(
      serverUrl + 'like',
      'POST',
      {},
      'application/json',
      data,
    );
    const [status]  = await response;
    if(status === 200){
      image.likes = [...image.likes, loggedUser.user_id];
    }
  }

  const send_unlike = async() => {
    const data = [{token:token}, likeInfo];
    fetch_data(
      serverUrl + 'like',
      'DELETE',
      {},
      'application/json',
      data,
    );
  }

  const handleLike = () => {
    setLike(!like)
    if(!like) {
      setNumLikes((prevState) => 
        prevState + 1
      );
      send_like();
    } else {
      setNumLikes((prevState) => 
        prevState - 1
      );
      image.likes = image.likes.filter((like) => like !== loggedUser.user_id)
      send_unlike();
    }
  }

  const send_comment = async(comms) =>  {
    const data = [{token:token}, comment];
    const response = fetch_data(
      serverUrl + 'comment',
      'POST',
      {},
      'application/json',
      data,
    );
    const [status, recived_data] = await response;
    if(status === 200){
      let res = comms.map((com) => com.comment_id === 'new' ?//Changing new comment id to id from database
        {...com, comment_id: recived_data}
        :
        com
      );
      setComments(res.slice(0,3));
      setAllComments(res);
    }
  }

  const submitComment = (e) => {
    e.preventDefault();
    let comms = [
      {content: comment.content,
      owner_username: loggedUser.username, 
      user_id: loggedUser.user_id,
      comment_id: comment.comment_id,
      created_at: Math.floor(Date.now()/1000),
      },
      ...allComments]
    setComment({...comment, content: ''});
    send_comment(comms);
    setAddComment(false);
  }

  const handleComment = (e) => {
    e.preventDefault();
    inputRef.current.style.height = '20px';//Changing textarea height accordingly to number of rows
    inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    setComment({...comment, content: e.target.value});
  }

  const handleAddComment = () => {
    setAddComment(!addComment);
    setComment({...comment, content:''});
  }

  //Need to change from show all comments to fetching all comments
  const handleShow = () => {
    setComments(allComments); 
    setShowComments(!showComments);
  }

  const deleteCom = async(com) => {
    const data = [{token:token},com]
    const response = fetch_data(
      serverUrl + 'comment',
      'DELETE',
      {},
      'application/json',
      data,
    );
    const [status] = await response;
    if(status === 200){
      let res = allComments.filter((comment) => com.comment_id !== comment.comment_id);
      if(!showComments){
        setComments(res.slice(0,3));
      }else{
        setComments(res);
      }
      setAllComments(res);
    }
  }

  const time_post = moment.unix(image.created_at).calendar(null, {
    sameDay: '[Today at] kk:mm',
    lastDay: '[Yesterday at] kk:mm',
    lastWeek: 'dddd [at] kk:mm',
    sameElse: 'MMM Do, YYYY',
    }
  );

  const clickedUsername = () => {
    navigate(`/${image.username}`);
  }

  const clickImage = (e) => {
    const path = e.target.src.split('/images/');
    navigate(`/images/${path[path.length - 1]}`);
  }

  //Fitting image
  const imageFit1= () => {
    const imgHeight = imgRef1.current.naturalHeight;
    const imgWidth = imgRef1.current.naturalWidth;
    
    if(imgHeight >= imgWidth){
      imgRef1.current.style['object-fit'] = 'fill';
    }else {
      imgRef1.current.style['object-fit'] = 'cover';
    }
    setLoadOwner(false);
  }

  //Setting observer
  //When observer enters the screen fetching for more images is triggered
  useEffect(() => {
    let observer = new IntersectionObserver(([entry]) => {setMoreImg(entry.isIntersecting);}, {rootMargin: '0px', threshold: 0.5,});
    const ref = obsRef.current
    if(ref){
      observer.observe(ref);
    }

    return () => {
      if(ref){
        observer.unobserve(ref);
      }
    }
  },[image]);


  return (
    <div className = 'image-post'>
      <div className = 'post-header'>
        <div className = 'image-username-container' >
          <div className = {loadOwner ? 'image-post-img-owner no-img' : 'image-post-img-owner'}  onClick = {clickedUsername} >
            <img style={loadOwner ? {display:'none'} : {}} ref={imgRef1} onLoad = {imageFit1} src={ serverUrl + image.profile_picture } alt='' />
          </div>
          <h2 onClick = {() => navigate(`/${image.username}`)}>{image.username}</h2>
        </div>
        { loggedUser.user_id === image.user_id ?
          <div ref = {delRef} className='del-edit-btn' onClick={() => setClickedMore(!clickedMore)}>
            <AiOutlineDown />
            {clickedMore &&
            <>
              <div className='triangle-more'></div>
              <div className='del-edit-container'>
                <p onClick={() => deletePost(image.post_id, image.image_path)} >Delete</p>
              </div>
            </>
            }
          </div>
          :
          <div></div>
        }
      </div>
      <p className = 'time post-time' >{time_post}</p>
      <p className = 'image-post-desc' >{image.description}</p>
      <div  className = 'image-post-img' >
        <img ref={imgRef} src={serverUrl + image.image_path} alt=""  onClick = {clickImage}/>
      </div>
      <div className ='like-comment'>
        <div className ='like-comment-text' >
          <p>{numLikes} likes </p>
        </div>
        <div className='like-comment-icons'>
          {!like ? 
            <AiOutlineHeart className='heart-icon' onClick={handleLike} />
          :
            <AiFillHeart style={{color:'red'}} className='heart-icon' onClick={handleLike}/>
          }

          <AiOutlineComment style = {{cursor:'pointer'}} onClick = { handleAddComment } />
        </div>
        <div ref = { commRef }>
          {comments.map((comment, i) => {
            return (
              <div className='post-comment' key={i}>
                <div className='username-time'>
                  <div className = 'comment-username'>
                    <p className='comment-user' onClick = {() => navigate(`/${comment.owner_username}`)} >{comment.owner_username}</p>
                  </div>
                  <div className='time-del-com'>
                    {comment.user_id === loggedUser.user_id || image.user_id === loggedUser.user_id ?
                      <AiOutlineDelete className= 'del-com-icon'  onClick={() => deleteCom(comment)} />
                      :
                      <div></div>
                    }
                    <p className='time comment-time' >{moment.unix(comment.created_at).fromNow()}</p>
                  </div>
                </div>
                <p>{comment.content}</p>
              </div>
            )})}
        </div>
        {!showComments && allComments.length > 3 ? <p className='time show' onClick = { handleShow }>show all comments...</p> :<></> }
        <div>
          {addComment &&
            <form className = 'comment-form'>
              <textarea ref={inputRef} className='text-input comment-input' value={comment.content} onChange={handleComment} autoFocus spellCheck = 'false' ></textarea>
              <AiOutlineSend  className='comment-submit' onClick = {submitComment} /> 
            </form>
            }
        </div>
      </div>
      {index === array.length - 4 && <div ref={obsRef}></div>}
    </div>
  );
}

export default Post;
