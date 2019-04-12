'use strict';
/**
 * Roles Model
 * Provides schema for MongoDB for ACL roles
 * @module src/auth/roles-model
 * @requires mongoose
 */

const mongoose = require('mongoose');

const rolesSchema = new mongoose.Schema({
  role: {type: String, required:true},
  capabilities: {type: Array, required:true},
});

module.exports = mongoose.model('roles', rolesSchema);
