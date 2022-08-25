// eslint-disable-next-line
export default {
  // When serving use network ip of computer hosting, Docker
  // API_ENDPOINT: `http://${process.env.REACT_APP_HOST_IP}:8000`,
  API_ENDPOINT: 'http://localhost:8000',
  FRONT_WEB: '*',
  API_TOKEN: 'f1e2993c',
  JWT_KEY: process.env.REACT_APP_JWT_TOKEN,
  USER_ID: ''
};
