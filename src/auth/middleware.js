'use strict';

/**
 * Authentication Middleware Module
 * Determines authentication type (Basic or Bearer) and authenticates user credentials/token accordingly
 * @module src/auth/middleware
 * @requires express
 */

const User = require('./users-model.js');

module.exports = (capability) => {

  return (req, res, next) => {

    try {
      let [authType, authString] = req.headers.authorization.split(/\s+/);

      switch (authType.toLowerCase()) {
        case 'basic':
          return _authBasic(authString);
        case 'bearer':
          return _authBearer(authString);
        default:
          return _authError();
      }
    } catch (e) {
      _authError();
    }

    /**
     * @function _authBasic
     * Authenticates users using Basic with usernames and passwords in the request header
     * @param {string} str Base 64 encoded username and password (joined by a colon ':') from the Authorization header
     * @returns {promise} The authenticateBasic method from the User model and its output
     * @returns {function} The _authenticate function which generates a token and attaches it to the request body.

     */
    function _authBasic(str) {
      // str: am9objpqb2hubnk=
      let base64Buffer = Buffer.from(str, 'base64'); // <Buffer 01 02 ...>
      let bufferString = base64Buffer.toString();    // john:mysecret
      let [username, password] = bufferString.split(':'); // john='john'; mysecret='mysecret']
      let auth = { username, password }; // { username:'john', password:'mysecret' }

      return User.authenticateBasic(auth)
        .then(user => _authenticate(user))
        .catch(_authError);
    }

    /**
     * @function _authBearer
     * Authenticates users using Bearer with a token in the request header
     * @param {string} authString The authentication token from the request Authorization header
     * @returns {promise} The authenticateToken method from the User model and its output
     * @returns {function} The _authenticate function which generates a token and attaches it to the request body.
     */
    function _authBearer(authString) {
      return User.authenticateToken(authString)
        .then(user => {
          return _authenticate(user);
        })
        .catch(_authError);
    }

    /**
     * @function _authenticate
     * Attaches a token to the request body, checks that the user has the required access to the route with the can() method from the Users model 
     * @param {object} user The user object from the database
     */
    function _authenticate(user) {
      if (user && (!capability || (user.can(capability)))) {
        req.user = user;
        req.token = user.generateToken();
        next();
      }
      else {
        _authError();
      }
    }

    /**
     * @function _authError
     * Calls express 'next' with a string indicating the error, gets picked up by the 500.js catch-all middleware
     */
    function _authError() {
      next('Invalid User ID/Password');
    }

  };

};