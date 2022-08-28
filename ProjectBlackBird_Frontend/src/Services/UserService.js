import config from '../config.js';

const UserService = {
  saveUserId(userId) {
    window.sessionStorage.setItem(config.USER_ID, userId);
  },
  getUserId() {
    return window.sessionStorage.getItem(config.USER_ID);
  },
  clearUserId() {
    window.sessionStorage.removeItem(config.USER_ID);
  }
};

export default UserService;
