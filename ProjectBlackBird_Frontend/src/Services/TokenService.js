const TokenService = {
  saveAuthToken(token) {
    TokenService.clearAuthToken();
    return window.sessionStorage.setItem('token', token);
  },
  getAuthToken() {
    return window.sessionStorage.getItem('token');
  },
  clearAuthToken() {
    window.sessionStorage.removeItem('token');
  },
  hasAuthToken() {
    return !!TokenService.getAuthToken();
  }
};

export default TokenService;
