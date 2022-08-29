const express = require('express');
const AuthService = require('./auth-service');
const authentication = express.Router();
const jsonParser = express.json();

// JWT check for login.
authentication.post('/login', jsonParser, (req, res, next) => {
  const db = req.app.get('db');
  const { username, password } = req.body;
  const loginUser = { username, password };

  for (const [key, value] of Object.entries(loginUser))
    if (value === null || value === undefined)
      return res.status(400).json({
        error: `Missing '${key}' in request body`,
        status: 400
      });

  // Looks up username in DB
  AuthService.getUserWithUserName(db, loginUser.username)
    .then(user => {
      const dbUser = user[0];
      if (!dbUser)
        return res.status(400).json({
          error: 'Incorrect username',
          status: 401
        });

      if (loginUser.password !== dbUser.password) {
        return res.status(400).json({
          error: 'Incorrect password',
          status: 401
        });
      }

      // TODO get working with password Hash
      // return AuthService.comparePasswords(loginUser.password, dbUser.password).then(compareMatch => {
      //   if (!compareMatch) {
      //     return res.status(400).json({
      //       error: 'Incorrect password'
      //     });
      //   }

      // Returns JWT token and user info to set front, so front end can then make another call for data
      const sub = dbUser.username;
      const payload = { userid: dbUser.oid };

      res.send({
        dbUser,
        authToken: AuthService.createJwt(sub, payload),
        status: 200
      });
    })
    .catch(next);
});

module.exports = authentication;
