//Fetching data
export const fetch_data = async(url = '', method_type ,extra_headers = {}, content_type='', data = {}) => {
  let options = {
    method: method_type, 
    // credentials: 'include', 
    // withCredentials: true, 
    headers: {
      'Content-Type': content_type,
      'Connection': 'keep-alive',
    },
  };
  if(Object.keys(extra_headers).length > 0){
    options.headers = {...options.headers, ...extra_headers};
  }
  if(Object.keys(data).length > 0){
    options = {...options, body: JSON.stringify(data)};
  }

  try{
    const response = await fetch(url, options);
    try{
      const recived_data = await response.json();
      return [response.status, recived_data];
    }catch{
      return [response.status];
    }
  }catch{
    return [503];
  }
}

// Checking for cookie
// export const check_cookie = () => {
//   const cookies = document.cookie.split(';');
//   for(let i=0; i < cookies.length; i++){
//     const cookie_value = cookies[i].split('=');
//     if(cookie_value[0].trim() === 'token'){
//       return cookies[i]
//     }
//   }
// }

