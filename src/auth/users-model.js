'use strict';

/*
http :3000/hidden-stuff "Authorization: Bearer "
echo '{"role":"superuser", "capabilities":["create","read","update","delete"]}' | http :3000/roles
echo '{"role":"admin", "capabilities":["read","update","delete"]}' | http :3000/roles
echo '{"role":"editor", "capabilities":["create", "read", "update"]}' | http :3000/roles
echo '{"role":"user", "capabilities":["read"]}' | http :3000/roles

*/

/**
 * Users Model
 * Provides schema for MongoDB and methods to aide user validation and authorization
 * @module src/auth/users-model
 * @requires mongoose
 * @requires bcrypt
 * @requires jsonwebtoken
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('./roles-model.js');

const SINGLE_USE_TOKENS = !!process.env.SINGLE_USE_TOKENS;
const TOKEN_EXPIRE = process.env.TOKEN_LIFETIME || '1h';
const SECRET = process.env.SECRET || 'foobar';

const usedTokens = new Set();

const users = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  role: { type: String, default: 'user', enum: ['superuser', 'admin', 'editor', 'user'] },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

/**
 * Creates a virtual field in the Users schema that is populated by the matching role in the Roles collection
 */
users.virtual('abilities', {
  ref: 'roles',
  localField: 'role',
  foreignField: 'role',
  justOne: false,
});

/**
 * Mongoose hook to populate the Users virtual field before finding a document in the database
 */
users.pre('findOne', function () {
  try {
    this.populate('abilities');
  }
  catch (error) { console.log('Find Error', error); }
});

/**
 * Mongoose hook to hash user passwords before they are stored in the database
 */
users.pre('save', function (next) {
  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(error => { throw new Error(error); });
});

/**
 * @method
 * User class method to find or create a user in the database when OAuth is used 
 * @param  {string} email Email address entered
 */
users.statics.createFromOauth = function (email) {

  if (!email) { return Promise.reject('Validation Error'); }

  return this.findOne({ email })
    .then(user => {
      if (!user) { throw new Error('User Not Found'); }
      return user;
    })
    .catch(error => {
      let username = email;
      let password = 'none';
      return this.create({ username, password, email });
    });

};

/**
 * @method 
 * @name authenticateToken
 * User class method to authenticate a token from the request header using the secret and find the user in the database
 * @param {string} token The authentication token
 */
users.statics.authenticateToken = function (token) {

  if (usedTokens.has(token)) {
    return Promise.reject('Invalid Token');
  }

  try {
    let parsedToken = jwt.verify(token, SECRET);
    (SINGLE_USE_TOKENS) && parsedToken.type !== 'key' && usedTokens.add(token);
    let query = { _id: parsedToken.id };
    return this.findOne(query);
  } catch (e) { throw new Error('Invalid Token'); }

};

/**
 * @method
 * User class method to authenticate a username and password from the request header against the user stored in the database
 * @param {object} auth The username and password passed in with the request header
 */
users.statics.authenticateBasic = function (auth) {
  let query = { username: auth.username };
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    .catch(error => { throw error; });
};

/**
 * @method
 * User instance method to compare a password against the hashed password attached to a user record from the database
 * @param {string} password The password passed in with the request header
 */
users.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
    .then(valid => valid ? this : null);
};

/**
 * @method
 * User instance method to generate a new token with the user's id, 
 * @param {string} type 'key' or undefined; checks if the token being generated should expire
 */
users.methods.generateToken = function (type) {

  let token = {
    id: this._id,
    // capabilities: this.capabilities,

    type: type || 'user',
  };

  let options = {};
  if (type !== 'key' && !!TOKEN_EXPIRE) {
    options = { expiresIn: TOKEN_EXPIRE };
  }

  return jwt.sign(token, SECRET, options);
};

// takes a capability: 'read', create', 'update', 'delete'
// returns true/false depending on if the user has that capability
/**
 * @method
 * User instance method to check the user's ACL capabilities against the route's requirements
 * @param {string} capability 'read', create', 'update', 'delete', or 'superuser'
 * @returns {boolean} true/false depending on if the user has that capability
 */
users.methods.can = function (capability) {
  console.log(`This route requires the "${capability}" capability to access.
User "${this.username}" has the following abilities: ${this.abilities[0].capabilities}`);

  return this.abilities[0].capabilities.includes(capability);
};

users.methods.generateKey = function () {
  return this.generateToken('key');
};

module.exports = mongoose.model('users', users);
