import TokenService from './Services/TokenService';

// Production
// eslint-disable-next-line
export default {
  // When serving use network ip of computer hosting, Docker- use with docker
  API_ENDPOINT: `http://${process.env.REACT_APP_HOST_IP}:8000`,
  FRONT_WEB: '*',
  API_TOKEN: '',
  JWT_TOKEN: `bearer ${TokenService.getAuthToken()}`,
  DISPLAY_NAME: ''
};

// Local Development
// eslint-disable-next-line
// export default {
//   API_ENDPOINT: 'http://localhost:8000',
//   FRONT_WEB: '*',
//   API_TOKEN: '',
//   JWT_TOKEN: `bearer ${TokenService.getAuthToken()}`,
//   DISPLAY_NAME: ''
// };
