'use strict';

const Q = require('../app.js').Q;


/**
 * Mongo Data Model Interface
 * @module src/models/mongo-model
 */
class Model {
  /**
   * Model constructor function. Any new instance is created by passing in a schema to define the structure of the data in each model.
   * @constructor
   * @param schema {object} An outline of the fields and pieces of data that are required by each data model. This may vary in each Model instance, e.g., the Players data model may have different required fields in its schema than the Teams data model.
   */
  constructor(schema) {
    this.schema = schema;
  }
  
  /**
   * Makes an http GET request for an individual record (by _id) or a list of all records if no _id is provided
   * @param {string} _id Unique identifier of an individual record (UUID format)
   * @returns The result of the query, either an individual record or all records in a collection.
   */
  get(_id) {
    let queryObject = _id ? {_id} : {};
    Q.publish('database', 'read', {message:'get() was used'});
    return this.schema.find(queryObject);
  }
  
  /**
   * Makes an http POST request to create a new record in a database.
   * @param  {object} record New record to write to database in JSON format. Must contain required fields defined in schema.
   */
  post(record) {
    let newRecord = new this.schema(record);
    Q.publish('database', 'create', {message:'post() was used'});
    return newRecord.save();
  }

  /**
   * Makes an http PUT request to edit an existing record in the database
   * @param  {string} _id Unique identifier of an individual record (UUID format)
   * @param  {object} record Updated record to write to database in JSON format. Must contain required fields defined in schema.
   * @returns {object} Updated record from the database 
   */
  put(_id, record) {
    Q.publish('database', 'update', {message:'put() was used'});
    return this.schema.findByIdAndUpdate(_id, record, {new:true});
  }

  /**
   * Makes an http DELETE request to destroy an existing record in the database
   * @param  {string} _id Unique identifier of an individual record (UUID format)
   * @returns {object} Empty object to indicate that record was successfully deleted.
   */
  delete(_id) {
    Q.publish('database', 'delete', {message:'delete() was used'});
    return this.schema.findByIdAndDelete(_id);
  }

}

module.exports = Model;
