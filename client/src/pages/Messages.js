import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGlobalContext } from './../context';
import { AiOutlineSend, AiOutlineArrowLeft} from 'react-icons/ai';
import { fetch_data } from './../functions';
import moment from 'moment';

const Messages = () => {
  const { token, serverUrl, loggedUser, message1, setMessageNot, seen, setTitle } = useGlobalContext();

  const [convo, setConvo] = useState({});//Clicked convo
  const [message, setMessage] = useState({
    convo_id:'', 
    sender: '', 
    reciver:'', 
    content: '',
    created_at: '',
  });//Message template for sending
  const [newConvo, setNewConvo] = useState(false);//Is new conversations
  const [convos, setConvos] = useState([]);//All conversations
  const [size, setSize] = useState(window.innerWidth);//Window size
  const [loadingC, setLoadingC] = useState(true);//Loading conversations
  const [loadingS, setLoadingS] = useState(true);//"Loading" scroll
  const [loadingM, setLoadingM] = useState(false);//Loading messages
  const [moreMsg, setMoreMsg] = useState(true);
  const [getMsg, setGetMsg] = useState(false);
  const [numMsg, setNumMsg] = useState(20);

  const user = useLocation();//User info if we come from profile page by pressing "Send Message" button

  const navigate = useNavigate();

  const inputRef = useRef();
  const dummyRef = useRef();//Ref to scroll to
  const imgRef = useRef();
  const imgRef1 = useRef();
  const convoRef = useRef();
  const msgRef = useRef();
  const obsRef = useRef();
  const scrollToRef = useRef();


  //Checking for window size because of responsiveness
  useEffect(() => {
    window.addEventListener('resize', checkSize);

    return () => {
      window.removeEventListener('resize', checkSize);
    };
  },[]);

  const checkSize = () => {
    setSize(window.innerWidth);
  }

  const check_convos = (convos, id) => {
    let result = convos.filter((convo) => convo.user1 === id || convo.user2 === id);
    return result;
  }

  useEffect(() => {
    const get_convos = async() => {
      const data = [{token:token}];
      const response = fetch_data(
        serverUrl + 'getconvo',
        'POST',
        {},
        'application/json',
        data,
      );
      const [status, recived_data] = await response;
      if(status === 200){
        //If we come from profile page by pressing "Send Message" button
        if(user.state){
          //Checking if we need to create new conversation or we have existing one 
          let check = check_convos(recived_data, user.state.user_id);
          //Creating new conversation
          if(check.length === 0){
            setConvos([{
              convo_id: 'new',
              user2: user.state.user_id,
              user1: loggedUser.user_id,
              user_img: user.state.profile_picture,
              username: user.state.username,
              updated_at: Date.now()/1000,
              messages: [], 
            },...recived_data]);
            setConvo({
              convo_id: 'new',
              user2: user.state.user_id,
              user1: loggedUser.user_id,
              user_img: user.state.profile_picture,
              username: user.state.username,
              messages: [], 
            });
            setMessage({
              convo_id: 'new', 
              sender: loggedUser.user_id,
              reciver: user.state.user_id,
              content:'', 
            });
            setNewConvo(true);
            setMoreMsg(false);
          //Existing conversations
          }else{
            setConvos(recived_data);
            recived_data.map((rec) => {
              if(rec.user1 === user.state.user_id || rec.user2 === user.state.user_id){
                setConvo(rec);
                setMessage({
                  convo_id: rec.convo_id, 
                  sender: loggedUser.user_id,
                  reciver: user.state.user_id,
                  content:'', 
                });
              }
            });
          }
          //Scroll to last message
          dummyRef.current.scrollIntoView();
          //Mobile version
          if (size < 501) {
            convoRef.current.style.zIndex = '10';
            msgRef.current.style.zIndex = '20';
          }
          //Time for scrolling to last message
          setTimeout(() => { setLoadingS(false)}, 300);
        }else{
          setConvos(recived_data);
        }
        setLoadingC(false);
      }
    }
    get_convos();//fetching conversations
    setTitle('Picture - messages');
  },[]);

  //Scroll to bottom of messages
  useEffect(() => {
    dummyRef.current.scrollIntoView();
  },[convo]);

  //Messages from long polling
  useEffect(() => {
    if(Object.keys(message1).length > 0){
      let res = [];
      //Put messages to corresponding conversation
      message1.map((msg) => {
        res = convos.map((convo) => msg.convo_id === convo.convo_id ? 
          {...convo, messages:[...convo.messages, msg], status: msg.sender}
          :
          convo
        );
        //If conversation is open update messages
        if(Object.keys(convo).length > 0 && msg.convo_id === convo.convo_id){
          setConvo((prev) =>  ({...prev, messages:[...prev.messages, msg]}));
          setMessageNot(true);//New message notification
          res = res.map((r) => r.convo_id === convo.convo_id ? {...r, status: 0} : r);
          seen_msg(convo.convo_id);//Send seen message
        }else{
          setMessageNot(false);
        }
      });
      setConvos(res);
      setMessageNot(false);
    }
  },[message1]);//New messages from polling

  //Time for scrolling to bottom of messages
  useEffect(() => {
    if(Object.keys(convo).length > 0){
      setTimeout(() => {setLoadingS(false)}, 300);
    }
  },[convo]);

  //Updating messages to seen 
  useEffect(() => {
    let res = convos.map((con) => con.convo_id === seen[0] ? 
      {...con, status:0}
      :
      con
    );
    if(Object.keys(convo).length > 0 && convo.convo_id === seen[0]){ 
      setConvo((prev) => ({...prev, status:0}));
    }
    setConvos(res);
  },[seen]);

  const handleMessage = (e) => {
    e.preventDefault();
    inputRef.current.style.height = '20px';
    inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    setMessage({...message, content: e.target.value});
  }

  //Sending message and creating new conversation
  const new_convo = async() => {
    const data = [{token:token}, message];
    const response = fetch_data(
      serverUrl + 'convo',
      'POST',
      {},
      'application/json',
      data,
    );
    const [status, recived_data] = await response;
    if(status === 200){
      let res_con = {};
      let res = convos.map((con) => {
        if(con.convo_id === 'new'){
          setNewConvo(false);
          //Changing convo_id from 'new' to convo_id from DB
          con = {...con, convo_id:recived_data.convo_id, messages:[...con.messages, {...message, convo_id: recived_data.convo_id, created_at: Date.now() / 1000}], status: loggedUser.user_id};
          res_con = con;
          return con;
        }else{
          return con;
        }
      });
      setMessage({...message, convo_id: recived_data.convo_id, content:''});
      setConvos(res);
      setConvo(res_con);
    }
  }

  //Sending message
  const send_msg = async() => {
    const data = [{token:token}, message];
    fetch_data(
      serverUrl + 'messages', 
      'POST', 
      {}, 
      'application/json',
      data,
    );
  }

  //Updating message to seen
  const seen_msg = async(convo_id) => {
    const data = [{token:token}, {convo_id: convo_id}];
    fetch_data(
      serverUrl + 'convo',
      'PUT', 
      {},
      'application/json',
      data,
    );
  }

  const sendMessage = () => {
    if(newConvo){
      new_convo();
    }else{
      send_msg();
    }
  }

  //Send message by hitting ENTER
  const handleSubmit = (e) => {
    if(e.keyCode === 13 && !e.shiftKey){
      e.preventDefault();
      if(message.content !== ""){
        let index = '';
        let updated_convos = [];
        let temp_convo = [];
        let temp_convos = convos.map((con, i) => {
          if(convo.convo_id === con.convo_id){
            index = i;
            return con = {...con, messages:[...con.messages, {...message, created_at:Date.now() / 1000} ], updated_at: Date.now() / 1000, status: loggedUser.user_id};
          }else{
            return con
          }
        });
        temp_convo = temp_convos.splice(index, 1);
        //Set last updated conversation to top of the list
        updated_convos = [...temp_convo, ...temp_convos];
        setConvos(updated_convos);
        if(convo.convo_id !== 'new'){
          setConvo((prev) => ({...prev,  messages:[...prev.messages, {...message, created_at: Date.now() / 1000} ],  status:loggedUser.user_id}));
        }
        sendMessage();
        setMessage({ ...message, content:''});
      }
    inputRef.current.style.height = '20px';
    inputRef.current.focus();
    }
  }

  //Send message by clicking send button
  const handleClick = () => {
    if(message.content !== ""){
      let index = '';
      let updated_convos = [];
      let temp_convo = [];
      let temp_convos = convos.map((con, i) => {
        if(convo.convo_id === con.convo_id){
          index = i;
          return con = {...con, messages:[...con.messages, {...message, created_at:Date.now() / 1000} ], updated_at: Date.now() / 1000 , status: loggedUser.user_id};
        }else{
          return con
        }
      });
      temp_convo = temp_convos.splice(index, 1);
      updated_convos = [...temp_convo, ...temp_convos];
      setConvos(updated_convos);
      if(convo.convo_id !== 'new'){
        setConvo((prev) => ({...prev,  messages:[...prev.messages, {...message, created_at: Date.now() / 1000} ], status:loggedUser.user_id}));
      }
      sendMessage();
      setMessage({ ...message, content:''});
      inputRef.current.style.height = '20px';
      inputRef.current.focus();
    }
  }

  //Clicking on conversation and displaying messages
  const clickConvo = (convo1) => {
    let reciver = '';
    if(convo1.convo_id !== convo.convo_id || !convo.convo_id){
      if(convo1.convo_id !== convo.convo_id){
        setLoadingS(true);
      }
      if(convo1.messages.length < 20){
        setMoreMsg(false);
      }else{
        setMoreMsg(true);
      }
      if(convo1.user1 !== loggedUser.user_id){
        reciver = convo1.user1;
      }else{
        reciver = convo1.user2;
      }
      if(convo1.status !== loggedUser.user_id && convo1.status !== 0){
        setConvo({...convo1, status: 0});
        seen_msg(convo1.convo_id);
      }else{
        setConvo(convo1);
      }
      setMessage({
        convo_id: convo1.convo_id,
        sender: loggedUser.user_id,
        reciver: reciver,
        content:'', 
      });
      if (size < 501) {
        convoRef.current.style.zIndex = '10';
        msgRef.current.style.zIndex = '20';
      }
      setNumMsg(20);
    }
  }

  //Navigating from messages to conversations on mobile version
  const goToConvo = () => {
    msgRef.current.style.zIndex = '10';
    convoRef.current.style.zIndex = '20';
    setConvo({});
  }

  const imageFit1= (img) => {
    const imgHeight = img.current.naturalHeight;
    const imgWidth = img.current.naturalWidth;
    
    if(imgHeight >= imgWidth){
      img.current.style['object-fit'] = 'fill';
    }else {
      img.current.style['object-fit'] = 'cover';
    }
  }

  const format_date = (time) => {
    const formated_date = moment.unix(time).calendar(null, {
      sameDay: '[Today]',
      lastDay: '[Yesterday]',
      lastWeek: 'dddd, Do MMM',
      sameElse: 'MMM Do, YYYY',
      }
    );

    return formated_date;
  }

  const format_date1 = (time) => {
    const formated_date = moment.unix(time).calendar(null, {
      sameDay: '[Today]',
      lastDay: '[Yesterday]',
      lastWeek: 'D.MM.YY.',
      sameElse: 'D.MM.YY.',
      }
    );

    return formated_date;
  }

  const format_time = (time) => {
    const formated_time = moment.unix(time).format('HH:mm');
    
    return formated_time;
  }

  const display_message = (msg, i, array) => {
    if(i === 0){
      return (
        <>
          {moreMsg ?//Fetching more messages
            !loadingM ? 
              <div></div>
            :
            <div className='loading-msg'>
              <img src='loading3.png' alt='' />
            </div>
          :
          <div></div>
          }
          <p className='time msg-date msg-date-first'>{format_date(msg.created_at)}</p>
          <div ref={obsRef} className={msg.sender === loggedUser.user_id ? 'msg-container msg-container-active' : 'msg-container'} > 
            <p>{msg.content}<span className='time msg-time'>{format_time(msg.created_at)}</span>
            </p>
          </div>
        </>
      );
    }else{
      const msg_day = moment.unix(msg.created_at).format('ddd');//Current message
      const msg_day_prev = moment.unix(array[i-1].created_at).format('ddd');//Previous message
      let scrollIndex;//When more messages are fetched and added stay on the last message => scrollToRef
      const res = array.length % 20;
      res === 0 ? scrollIndex = 19 : scrollIndex = res;//Set scrollIndex to last fetched message
      if(i === scrollIndex){
        if(msg_day !== msg_day_prev){//If the day of the messages is different print message date above message
          return (
            <>
              <p className='time msg-date'>{format_date(msg.created_at)}</p>
              <div  ref={scrollToRef} className={msg.sender === loggedUser.user_id ? 'msg-container msg-container-active' : 'msg-container'} > 
                <p>{msg.content}<span className='time msg-time'>{format_time(msg.created_at)}</span>
                </p>
              </div>
            </>
          );
        }else{
          return (
              <div  ref={scrollToRef} className={msg.sender === loggedUser.user_id ? 'msg-container msg-container-active' : 'msg-container'} > 
                <p>{msg.content}<span className='time msg-time'>{format_time(msg.created_at)}</span>
                </p>
              </div>
          );
        }
      }else{
        if(msg_day !== msg_day_prev){
          return (
            <>
              <p className='time msg-date'>{format_date(msg.created_at)}</p>
              <div  className={msg.sender === loggedUser.user_id ? 'msg-container msg-container-active' : 'msg-container'} > 
                <p>{msg.content}<span className='time msg-time'>{format_time(msg.created_at)}</span>
                </p>
              </div>
            </>
          );
        }else{
          return (
              <div  className={msg.sender === loggedUser.user_id ? 'msg-container msg-container-active' : 'msg-container'} > 
                <p>{msg.content}<span className='time msg-time'>{format_time(msg.created_at)}</span>
                </p>
              </div>
          );
        }
      }
    }  
  }

  //Lazy loading messages
  const get_messages = async() => {
    const data = [{token:token}, {convo_id: convo.convo_id, num: numMsg}];
    const response = fetch_data(
      serverUrl + 'messages',
      'PUT',
      {},
      'application/json',
      data,
    );
    const [status, recived_data] = await response;
    if(status === 200){
      setConvo((prev) => ({...convo, messages:[...recived_data, ...prev.messages]}));
      setNumMsg((prev) => prev + 20);
      setLoadingM(false);
      recived_data.length < 20 && setMoreMsg(false);
      if(recived_data.length > 0){
        scrollToRef.current.scrollIntoView();//Scroll to last message before fetching
      }
    }
  }

  useEffect(() => {
    if(moreMsg && getMsg){
      setLoadingM(true);
      get_messages();
    }
  },[getMsg]);

  //Observer for lazy loading
  useEffect(() => {
    let observer = new IntersectionObserver(([entry]) => {setGetMsg(entry.isIntersecting);}, {rootMargin: '0px', threshold: 0.5,});
    const ref = obsRef.current
    if(ref){
      observer.observe(ref);
    }

    return () => {
      if(ref){
        observer.unobserve(ref);
      }
    }
  },[convo]);


  return (
    <div className='messages'  >
      <div ref={convoRef} className='messages-conv-container'>
        {!loadingC ? 
          convos.length > 0 ?
            convos.map((con, i) => {
              return (
                <div key={i} className={con.convo_id === convo.convo_id  || (con.status !== loggedUser.user_id && con.status !== 0 && con.convo_id !== 'new') ? 'convo-container convo-container-active' : 'convo-container' }  onClick = {() => clickConvo(con)}>
                  <div className='messages-conv-imgUsrT'>
                    <div className='messages-conv-imgUsr'>
                      <div className='messages-conv-img'>
                        <img  ref = {imgRef1} src={serverUrl + con.user_img } alt='' onLoad = {() => imageFit1(imgRef1)}  />
                      </div>
                      <p>{con.username}</p>
                    </div>
                    <p className='time messages-conv-time'>{format_date1(con.updated_at)}</p>
                  </div>
                  {con.messages.length > 0 ? 
                    <p className='time messages-conv-text'>{
                      con.messages[con.messages.length - 1].sender === loggedUser.user_id ? 
                        'me: ' + con.messages[con.messages.length - 1].content
                        :
                        con.messages[con.messages.length-1].content
                      }
                    </p> 
                    :
                    <div></div>
                  } 
                </div>
              );})
          :
          <div className='no-convo'>
            <p>No messages</p>
          </div>
          :
          <div className='loading-convos'>
            <img src='loading3.png' alt='' />
          </div>
        }
      </div>
      <div ref = {msgRef} className='messages-show-container'>
        <div className='clicked-convo'>
          <div className ='go-back-btn' onClick = {goToConvo} >
            <AiOutlineArrowLeft />
          </div>
          <div className = 'clicked-convo-userimg' 
            onClick = {() => navigate(`/${convo.username}`)}>
            <div className = 'clicked-convo-img'>
              <img ref = {imgRef} src = {serverUrl + convo.user_img} alt ='' onLoad = {() => imageFit1(imgRef)} />
            </div>
            <p>{convo.username}</p>
          </div>
        </div>
        {convo.convo_id ?
          <>
            <div className = {loadingS ? 'messages-loading loading-div' : 'messages-loading done'}><img src='loading3.png' alt='' /></div>
            <div className='messages-container'>
              {convo.messages.length > 0 && convo.messages.map((msg, i, array) => {
                return (
                  <div key = {i} className='message-div'>
                    {display_message(msg, i, array)}
                  </div>
                );
              })}
              {convo.messages.length > 0 ? convo.status === 0 && convo.messages[convo.messages.length - 1].sender === loggedUser.user_id ? 
                <p className='time msg-seen'>seen</p>
                :
                <div></div>
                :
                <div></div>
              }
              <div ref={dummyRef}></div>
            </div>
            <form className='msg-form'>
              <textarea 
                ref = { inputRef } 
                className='text-input msg-input'
                spellCheck = 'false'
                value = { message.content } 
                onChange = {handleMessage}
                onKeyDown = {handleSubmit}
              >
              </textarea>
              <AiOutlineSend className='send-message'  onClick={handleClick} />
            </form>
          </>
          :
          <div ref={dummyRef}></div>
        }
      </div>
    </div>
  );
}

export default Messages;
