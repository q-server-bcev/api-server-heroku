'use strict';
/**
 * Categories Model
 * @module src/models/categories/categories-model
 */

const Model = require('../memory-model.js');

const schema = {
  _id: {required:true},
  name: {required:true},
};

/**
* Extends the memory model class to create a Categories class. Exports an instance of a data model for categories.
* @param schema {object} Schema with required document fields
*/
class Categories extends Model {}

module.exports = new Categories(schema);
