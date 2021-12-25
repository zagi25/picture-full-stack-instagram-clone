import { useGlobalContext } from './../context';
import { fetch_data } from './../functions';
import { useState, useEffect } from 'react';
import Post from './../components/Post';

const Home = () => {
  const { serverUrl, images, setImages, token, setTitle } = useGlobalContext();

  const [loadingImg, setLoadingImg] = useState(true);
  const [numImg, setNumImg] = useState(10);//Number of images to fetch with lazy loading
  const [moreImg, setMoreImg] = useState(false);//Fetch more images
  const [fetchingNewImg, setFetchingNewImg] = useState(false);
  const [noMore, setNoMore] = useState(false);//No more images to fetch

  const get_images = async() => {
    const data = [{token: token}, {numImg: 0}];
    const response = fetch_data(
      serverUrl+'getimage',
      'POST', 
      {}, 
      'application/json',
      data,
    );
    const [status, recived_data] = await response;
    if(status === 200){
      setImages(recived_data);
      setLoadingImg(false);
      recived_data.length < 10 && setNoMore(true);
    }
  }

  const get_more_images = async() => {
    const data = [{token: token}, {numImg: numImg}];
    const response = fetch_data(
      serverUrl+'getimage',
      'POST',
      {},
      'application/json',
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

  useEffect(() => {
    get_images();
  }, [token]);

  useEffect(() => {
    if(!noMore && moreImg){ 
      setFetchingNewImg(true);
      get_more_images();
    }
  },[moreImg]);

  useEffect(() => {
    setTitle('Picture');
  },[]);


  return (
    <div className='home-profile'>
      {!loadingImg ? 
        images.length > 0 ? 
            images.map((image, i, array) => <Post  setMoreImg = {setMoreImg} image={image} index={i} array={array} key={i} />)
          :
          <div className='no-post'>
            <p>No posts to show.</p>
          </div>
        :
        <div className='loading-div'><img src='loading2.png' alt='' /></div>
      }
      {fetchingNewImg && !noMore ?  <div><img src='loading3.png' alt='' /></div> : <div></div>}
    </div>
  );
}

export default Home;
