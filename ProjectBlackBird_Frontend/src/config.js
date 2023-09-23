import TokenService from './Services/TokenService';

const config = {
   REACT_APP_ENV: process.env.REACT_APP_ENV,
   API_ENDPOINT: process.env.REACT_APP_ENV === 'development' ? process.env.REACT_APP_API_ENDPOINT_DEV : process.env.REACT_APP_API_ENDPOINT_PROD,
   FRONT_WEB: '*',
   API_TOKEN: process.env.REACT_APP_API_TOKEN,
   JWT_TOKEN: `bearer ${TokenService.getAuthToken()}`
};

export default config;
