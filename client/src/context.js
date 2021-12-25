import React,  {useState, useContext, useEffect } from 'react';
import { fetch_data } from './functions';

const AppContext = React.createContext();

const AppProvider = ({children}) => {
  const [token , setToken] = useState('');
  const [isLogged , setIsLogged] = useState(false);
  const [serverUrl, setServerUrl] = useState('http://192.168.1.25:8000/');
  // const [serverUrl, setServerUrl] = useState('https://picture-server-side.herokuapp.com/');
  const [clientUrl, setClientUrl] = useState('http://192.168.1.25:3000/');
  // const [clientUrl, setClientUrl] = useState('https://picture-client-side.herokuapp.com/');
  const [loadingToken, setLoadingToken] = useState(true);
  const [loggedUser, setLoggedUser] = useState({
    user_id: '',
    username: '', 
    img: '',
  });
  const [isComment, setIsComment] = useState(false)
  const [images, setImages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sendPoll, setSendPoll] = useState(false);
  const [notification, setNotification] = useState({});
  const [image1, setImage1] = useState({});
  const [message1, setMessage1] = useState({});
  const [messageNot, setMessageNot] = useState(false);
  const [seen, setSeen] = useState('');
  const [time, setTime] = useState({now: Date.now() / 1000});
  const [title, setTitle] = useState('Picture');


  useEffect(() => {
    document.title = title;
  },[title]);

  useEffect(() => {
    let token1 = sessionStorage.getItem('token');
    if(token1){
      setToken(token1);
      setIsLogged(true);
      setLoadingToken(false);
    }else{
      setLoadingToken(false);
    }
  },[]);

  //Checking if there is new messages
  useEffect(() => {
    const check_msg = async() => {
      const data = [{token:token}]
      const response = fetch_data(
        serverUrl + 'getmessages',
        'POST', 
        {}, 
        'application/json',
        data,
      );
      const [status, recived_data] = await response;
      if(status === 200){
        setMessageNot(recived_data.new_msg);//New message notification
      }
    }

    if(token){
      check_msg();
    }
  },[token, serverUrl]);

  //Long polling
  useEffect(() => {
    const poll = async() => {
      const data = [{token:token}, time]
      const response = fetch_data(
        serverUrl + 'poll',
        'POST',
        {},
        'application/json',
        data,
      );
      const [status, recived_data] = await response;
      if(status === 200){
        //New notification
        if(recived_data.notifications){
          setTime({now: Date.now() / 1000});
          setNotification(recived_data.notifications[0]);
        }
        //New images posted
        if(recived_data.images){
          setTime({now: Date.now() / 1000});
          setImage1(recived_data.images[0]);
        }
        //New messages recived
        if(recived_data.messages){
          setTime({now: Date.now() / 1000});
          setMessage1(recived_data.messages);
          setMessageNot(true);
        }
        //Seen message
        if(recived_data.seen_message){
          setTime({now: Date.now() / 1000});
          setSeen(recived_data.seen_message);
        }
        setSendPoll(!sendPoll);
      }else if(status === 503){
        setSendPoll(!sendPoll);
      }
    }
    if(token){
      poll();
    }
  },[token, sendPoll, serverUrl]);

  useEffect(() => {
    if(Object.keys(notification).length > 0){
      setNotifications((prev) => [notification, ...prev]);
    }
  },[notification]);


  useEffect(() => {
    if(Object.keys(image1).length > 0){
      setImages((prev) => [image1, ...prev]);
    }
  },[image1]);

  //Getting logged user data
  useEffect(() => {
    const user = async() => {
      const data = [{token:token}]
      const response = fetch_data(
        serverUrl+'getlogin',
        'POST',
        {},
        'application/json',
        data,
      );
      const [status, recived_data] = await response;
      if(status === 200){
        setNotifications(recived_data[0]['notifications']);
        setLoggedUser({
          user_id: recived_data[0]['user_id'],
          username: recived_data[0]['username'],
          img: recived_data[0]['profile_picture'],
        });
      }
    }
    if(token){
      user();
    }
  },[token, serverUrl]);


  return (
    <AppContext.Provider value = {{
      token,
      setToken,
      serverUrl,
      loadingToken, 
      isLogged,
      setIsLogged,
      loggedUser,
      setLoggedUser,
      clientUrl,
      isComment,
      setIsComment,
      images,
      setImages,
      notifications,  
      setNotifications,
      image1,
      sendPoll,
      setSendPoll,
      message1,
      setMessage1,
      messageNot, 
      setMessageNot,
      seen,
      setTitle,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useGlobalContext = () => {
  return useContext(AppContext);
}

export { AppContext, AppProvider}
