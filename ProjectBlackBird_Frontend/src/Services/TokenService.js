const TokenService = {
  saveAuthToken(token) {
    window.sessionStorage.setItem('jwtToken', token);
  },
  getAuthToken() {
    return window.sessionStorage.getItem('jwtToken');
  },
  clearAuthToken() {
    window.sessionStorage.removeItem('jwtToken');
  },
  hasAuthToken() {
    return !!TokenService.getAuthToken();
  }
};

export default TokenService;
