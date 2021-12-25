import { Link } from 'react-router-dom';

const PlsLog = () => {
  return (
    <div className='pls-log'>
      <h1>Please <Link to='/'>Log in</Link> to see this page.</h1>
    </div>
  );
}

export default PlsLog;
