'use strict';
/**
 * Authentication Router Module
 * Manages routes used to sign-up and sign-in using various authentication methods (Basic, Bearer, OAuth)
 * @module src/auth/router
 * @requires express
 */

/**
 * Express module
 * @const
 */
const express = require('express');

/**
 * Express router to mount authentication-related functions on
 * @type {object}
 * @const
 * @namespace authRouter
 */
const authRouter = express.Router();

/**
 * Users model module
 * @const
 */
const User = require('./users-model.js');

/**
 * Authentication middleware module
 * @const
 */
const auth = require('./middleware.js');

/**
 * OAuth middleware module for Google
 * @const
 */
const oauth = require('./oauth/google.js');

/**
 * Dummy routes module
 * @const
 */
const newRoutes = require('./new-routes.js');

/**
 * Route for signing-up a new user to the database
 * @name post/signup
 * @function
 * @memberof module:src/auth/router~authRouter
 * @param {string} path Express path
 * @param {callback} middleware Express middleware (req, res, next)
 */
authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then((user) => {
      req.token = user.generateToken();
      req.user = user;
      res.set('token', req.token);
      res.cookie('auth', req.token);
      res.send(req.token);
    })
    .catch(next);
});

/**
 * Route for signing-in a user
 * @name  post/signin
 * @function
 * @memberof module:src/auth/router~authRouter
 * @param {string} path Express path
 * @param {callback} auth Authentication middleware
 * @param {callback} middleware Express middleware (req, res, next)
 */
authRouter.post('/signin', auth(), (req, res, next) => {
  res.cookie('auth', req.token);
  res.send(req.token);
});

/**
 * Route for OAuth sign-in using Google Plus
 * @name  get/oauth
 * @function
 * @memberof module:src/auth/router~authRouter
 * @param {string} path Express path
 * @param {callback} middleware Express middleware (req, res, next)
 */
authRouter.get('/oauth', (req, res, next) => {
  oauth.authorize(req)
    .then(token => {
      res.status(200).send(token);
    })
    .catch(next);
});

/**
 * Route for returning a permanent user token
 * @name  post/key
 * @function
 * @memberof module:src/auth/router~authRouter
 * @param {string} path Express path
 * @param {callback} auth Authentication middleware
 * @param {callback} middleware Express middleware (req, res, next)
 */
authRouter.post('/key', auth(), (req, res, next) => {
  let key = req.user.generateKey();
  res.status(200).send(key);
});

authRouter.use(newRoutes);

module.exports = authRouter;
