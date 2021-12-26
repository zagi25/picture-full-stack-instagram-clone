import { useState, useEffect, useRef } from 'react';
import { useGlobalContext } from './../context';
import { fetch_data } from './../functions';
import { useNavigate } from 'react-router-dom';
import { BsPlusSquare } from 'react-icons/bs';
import { AiOutlineBell, AiOutlineMessage, AiOutlineMenu} from 'react-icons/ai';
import moment from 'moment';


const Navbar = () => {
  const { clientUrl, serverUrl,  token, setToken, setIsLogged, loggedUser, setLoggedUser, setIsComment, notifications , setNotifications, messageNot, setMessageNot, setImages, setTitle } = useGlobalContext();

  const [imgLoad, setImgLoad] = useState(false);
  const [clickedN, setClickedN] = useState(false);//Show notifications container
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [not, setNot] = useState(false);//New notifications
  const [toggle, setToggle] = useState(false);
  const [loadingResult, setLoadingResult] = useState(true);

  const navigate = useNavigate();

  const notRef = useRef();//Ref used to check for click outside notifications container
  const imgRef = useRef();//Ref used to fit profile image
  const navRef = useRef();//Ref for navbar menu on mobile version
  const toggleRef = useRef();//Ref used to check for click for outside navbar menu on mobile version


  const handleImgLoad = () => {
    imageFit();
    setImgLoad(true);
  }

  //Event listeners for clicks outside notifications container and navbar menu
  useEffect(() => {
    document.addEventListener('mousedown', handleClickN);
    document.addEventListener('mousedown', navToggle);

    return () => {
      document.removeEventListener('mousedown', handleClickN);
      document.removeEventListener('mousedown', navToggle);
    };
  },[]);

  //Showing navbar menu on screen on mobile verision
  useEffect(() => {
    if(!toggle){
      navRef.current.style.transform = 'translateX(10rem)';
    }else{
      navRef.current.style.transform = 'translateX(0rem)';
    }
  },[toggle]);

  //Fetching search results from searching users
  useEffect(() => {
    const get_result = async() => {
      const data = [{token: token}, search]
      const response = fetch_data(
        serverUrl + 'search',
        'POST',
        {}, 
        'application/json',
        data,
      );
      const [status, recived_data] = await response;
      if(status === 200){
        setSearchResult(recived_data);
        setLoadingResult(false);
      }else if(status === 400){
        setSearchResult([]);
      }
    }
    if(search){
      get_result();
    }else{
      setSearchResult([]);
    }
  },[search, serverUrl ]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoadingResult(true);
    setSearch(e.target.value);
  } 

  //Clicking on search result
  const handleSearchNav = (res) => {
    setSearch('');
    setSearchResult([]);
    navigate(`/${res.username}`)
  }

  //Checking for clicking notification icon
  const handleClickN = (e) => {
    if(notRef.current.contains(e.target)) {
      return;
    }else{
      setClickedN(false);
    }
  }

  //Checking for clicking toggle button
  const navToggle = (e) => {
    if(toggleRef.current.contains(e.target)){
      return;
    }else{
      setToggle(false);
    }
  }

  const goHome = () => {
    if(window.location.href === clientUrl ){
      window.location.reload();
    }else{
      navigate('/');
    }
  }

  const goProfile = () => {
    if(window.location.href === clientUrl + loggedUser.username){
      window.location.reload();
    }else{
      navigate(`/${loggedUser.username}`);
    }
  }

  const send_logout = async() => {
    const data = [{token: token}]
    const response = fetch_data(
      serverUrl + 'users', 
      'PUT', 
      {},
      'text/html', 
      data, 
    );
    const [status] = await response;
    if(status === 200){
      sessionStorage.clear();
      setIsLogged(false);
      setToken('');
      setLoggedUser({
        user_id: '', 
        username: '', 
        img: '',
      })
      setNotifications([]);
      setImages([]);
      setTitle('Picture');
      navigate('/')
    }
  }
  
  const handleClickedAdd = () => {
    navigate('/post_image')
  }

  //If hovering on notification =>  set notification to "seen"
  const hoverNot = (not) => {
    const hoverd_not = notifications.map((n) => 
      n.notif_id === not.notif_id ? 
        n = {...n, status:1 }
        : 
        n
    );
    if(not.status === 0){
      send_not_update(not.notif_id);
    }
    setNotifications(hoverd_not);  
  }

  //Sending "seen" notification
  const send_not_update = async(notif_id) => {
    const data = [{token:token}, { id: notif_id}];
    fetch_data(
      serverUrl + 'notifications',
      'POST',
      {},
      'text/html',
      data,
    );
  }

  //Clicking notification
  const clickNot = (not) => {
    //If clicked follow notification go to profile of notification "sender"
    if(not.notif_type === 'follow' || not.notif_type === 'follow_accept' || not.notif_type === 'following_you'  ){
      setClickedN(false);
      navigate(`/${not.sender}`);

    //If clicked comment notification go to post page and scroll down to comments
    }else if(not.notif_type === 'comment' || not.notif_type === 'comment_also'){
      const path = not.img.split('/');
      setClickedN(false);
      setIsComment(true);
      navigate(`/images/${path[path.length - 1]}`);

    //Just go to post page without scrolling down to comments
    }else{
      const path = not.img.split('/');
      setClickedN(false);
      navigate(`/images/${path[path.length - 1]}`);
    }
    hoverNot(not);//Update notification
  }

  //Check if there is new notifications
  useEffect(() => {
    const checkNot = () => {
      if(notifications.length > 0){
        const check = notifications.find((not) => not.status === 0);
        setNot(check);
      }else{
        setNot(false);
      }
    }
    checkNot();
  },[notifications]);

  //Fitting image based on dimensions of image
  const imageFit = () => {
    const imgHeight = imgRef.current.naturalHeight;
    const imgWidth = imgRef.current.naturalWidth;
    
    if(imgHeight >= imgWidth){
      imgRef.current.style['object-fit'] = 'fill';
    }else {
      imgRef.current.style['object-fit'] = 'cover';
    }
  }
  
  const convert_time = (created_at) => {
    moment.updateLocale('en', {
        relativeTime : {
            past:   "%s ago",
            s  : '%ds',
            ss : '%ds',
            m:  "%dm",
            mm: "%dm",
            h:  "%dh",
            hh: "%dh",
            d:  "%dd",
            dd: "%dd",
            w:  "%dw",
            ww: "%dw",
            M:  "%dm",
            MM: "%dm",
            y:  "%dy",
            yy: "%dy"
        }
    });
    const time = moment.unix(created_at).fromNow(true);
    return time;
  }


  return (
    <header className = 'navbar'>
      <div className = 'navbar-logo-container' onClick = {goHome}>
        <div className='logo'>
          <img src='logo.png' alt='LOGO' />
        </div>
        <h1>PICTURE</h1>
      </div>
      <div className='navbar-searchbar' >
        <input 
        placeholder='search' 
        className='text-input 
        navbar-search' 
        type='text' 
        value={search} 
        onChange = { handleSearch } 
        />
        {search ?
            !loadingResult ? 
              searchResult.length > 0 ?
                <div  className='navbar-result-container'>
                  {searchResult.map((res, i) => {
                    return (
                      <div key={i}   className='navbar-result' onClick = {() => handleSearchNav(res) }>
                        <div className='navbar-img' >
                          <img src = {serverUrl + res.profile_picture} alt='' />
                        </div>
                        <p>{res.username}</p>
                      </div>
                  )})}
                </div>
                :
                <div className='navbar-result-container'>
                  <p className='navbar-result-nouser'>No user found</p>
                </div>
              :
              <div className='navbar-result-container loading-res'>
                <img src='loading3.png' alt= '' />
              </div>
          :
          <div>
          </div>
        }
      </div>
      <div ref={navRef}  className = 'navbar-imglog-container'>
        <div className='navbar-icons'>
          <div className='navbar-msg'>
            {messageNot ? 
              <div className='navbar-notif-dot message-dot'></div> 
            : 
              <div></div>
            } 
            <AiOutlineMessage  onClick={() => {
              setMessageNot(false);
              navigate('/messages')
            }}/> 
          </div>
          <div className = 'navbar-notif-container' ref={notRef} >
            <div className='navbar-notif' onClick = {() => setClickedN(!clickedN)} >
              {not ? 
              <div className='navbar-notif-dot'></div> 
              : 
              <div></div>
              } 
              <AiOutlineBell />
            </div>
            {clickedN &&
            <div>
              <div className='triangle'></div>
              <div  className='notifications-container'>
                {notifications.length > 0 ? 
                  notifications.map((not, i) => {
                    const time = convert_time(not.created_at);
                  return (
                    <div key={i} 
                      className={not.status === 0 ? 'notification not-seen' : 'notification'} 
                      onClick = {() => clickNot (not) } 
                      onMouseEnter={() => hoverNot(not)} 
                    >
                      <p><strong>{not.sender}</strong>
                      {not.notif_type === 'like' ?
                        ' likes your photo. '
                        : not.notif_type === 'comment' ?
                        ' left a comment on your photo. '
                        : not.notif_type === 'follow_accept' ?
                          ' accepted your follow request. '
                        : not.notif_type === 'following_you' ?
                          ' is now following you. ' 
                        :
                          not.notif_type === 'comment_also' ?
                          ' left a comment on the photo. '
                        :
                          ' wants to follow you. '
                      }
                      </p>
                      {not.notif_type !== 'follow' && not.notif_type !== 'follow_accept'  && not.notif_type !=='following_you' ?
                        <div className='notification-img'>
                          <img src={serverUrl + not.img} alt='' />
                        </div>
                        :
                        <div></div>
                      }
                      <p className='time not-time' >{time}</p>
                    </div>
                  );})
                  :
                  <div className='no-notification' >
                    <p>No notifications found</p>
                  </div>
                }
              </div>
            </div>
              }
          </div>
          <div className = 'navbar-add-img' onClick = { handleClickedAdd } > 
            <BsPlusSquare  />
          </div>
        </div>
        <div  className = { imgLoad ? 'navbar-img-container' : 'navbar-img-container no-img-navbar'}>
          <img 
          style={ !imgLoad ? {display: 'none'} : {}} 
          src={serverUrl + loggedUser.img} 
          alt="" 
          onLoad = {handleImgLoad}
          onClick = {goProfile}
          ref={imgRef}
          />
        </div>
        <button className = 'navbar-btn btn' onClick = {send_logout} >Logout</button>
      </div>
      <div ref = {toggleRef} className = 'navbar-toggle'  
        onClick={() => setToggle(!toggle)}>
        { not || messageNot ? 
          <div className ='navbar-notif-dot toggle-dot'></div>
          :
          <div></div>
        }
        <AiOutlineMenu />
      </div>
    </header>
  );
}

export default Navbar;
