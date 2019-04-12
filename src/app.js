'use strict';
const Q = require('@nmq/q/client');

/**
 * API Server Module
 * @module src/app
 */

const cwd = process.cwd();

// 3rd Party Resources
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Esoteric Resources
const errorHandler = require(`${__dirname}/middleware/500.js`);
const notFound = require(`${__dirname}/middleware/404.js`);
const authRouter = require(`${__dirname}/auth/router.js`);
const v1Router = require(`${__dirname}/api/v1.js`);

// Prepare the express app
const app = express();

// App Level MW
app.use(cors());
app.use(morgan('dev'));
app.use('/docs', express.static('docs'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(authRouter);
app.use(v1Router);

// Catchalls
app.use(notFound);
app.use(errorHandler);

/**
 * Starts server on specified port
 * @param port {integer} Port used to run the server, defaults to process.env.PORT
 */
let isRunning = false;
const populateRoles = require('./middleware/populate-roles.js');
module.exports = {
  server: app,
  start: (port) => {
    if( ! isRunning ) {
      app.listen(port, () => {
        isRunning = true;
        console.log(`Server Up on ${port}`);
        app.post('/roles', populateRoles);
        populateRoles();
        Q.publish('database', 'api-server', {message:'api-server is up'});
      });
    }
    else {
      console.log('Server is already running');
    }
  },
  Q:Q,
};
