const UserService = {
  saveUserId(user) {
    window.sessionStorage.setItem('userId', user.oid);
    window.sessionStorage.setItem('user', user.displayname);
    window.sessionStorage.setItem('role', user.role);
  },
  getUserId() {
    return window.sessionStorage.getItem('userId');
  },
  getUserDisplayName() {
    return window.sessionStorage.getItem('user');
  },
  getUserRole() {
    return window.sessionStorage.getItem('role');
  },
  clearUserId() {
    window.sessionStorage.removeItem('userId');
    window.sessionStorage.removeItem('user');
    window.sessionStorage.removeItem('role');
  }
};

export default UserService;
