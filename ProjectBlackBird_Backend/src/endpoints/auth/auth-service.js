const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../../config');

const AuthService = {
  getUserWithUserName(db, username) {
    return db('employee').where('username', username);
  },
  comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  },
  createJwt(subject, payload) {
    return jwt.sign(payload, config.ACCESS_TOKEN, {
      subject,
      expiresIn: config.JWT_EXPIRATION,
      algorithm: 'HS256'
    });
  },
  verifyJwt(token) {
    return jwt.verify(token, config.ACCESS_TOKEN, {
      algorithms: ['HS256']
    });
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  }
};

module.exports = AuthService;
