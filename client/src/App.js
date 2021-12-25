import { useEffect } from 'react';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import PostImage from './pages/PostImage';
import DisplayImage from './pages/DisplayImage';
import Messages from './pages/Messages';
import PlsLog from './pages/PlsLog';
import Navbar from './components/Navbar';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {useGlobalContext} from './context';

const App = () => {
  const { loadingToken, isLogged} = useGlobalContext();

  useEffect(() => {
    window.scrollTo(0,0);
  },[]);


  return (
    <BrowserRouter>
      {!loadingToken ?
        isLogged ? 
          <>
            <Navbar />
            <Routes>
              <Route path = '/' element ={ <Home /> } />
              <Route path = '/:username' element = { <Profile /> } />
              <Route path = '/post_image' element = { <PostImage />} />
              <Route path = '/images/:image' element = { <DisplayImage />} /> 
              <Route path = '/messages' element = { <Messages /> } />
              <Route path = '*' element = { <h1>Nema</h1>} />
            </Routes>
          </>
          :
          <Routes>
            <Route path = '/' element={<Login />} />
            <Route path = '/signup' element = {<Signup />} />
            <Route path = '*' element = {<PlsLog />} />
          </Routes>
        :
        <div></div>
      }
    </BrowserRouter>
  );
}

export default App;
