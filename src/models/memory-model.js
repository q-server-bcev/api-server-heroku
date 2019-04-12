'use strict';

const uuid = require('uuid/v4');

/**
 * Memory Data Model
 * @module src/models/memory-model
 */
class Model {

  /**
   * Creates an instance of a memory Model.
   * @param {object} schema An outline of the fields and pieces of data that are required by each data model. This may vary in each Model instance, e.g., the Players data model may have different required fields in its schema than the Teams data model.
   */
  constructor(schema) {
    this.schema = schema;
    this.database = [];
  }

  /**
   * Method to "sanitize" user entry of records into the database. Goes through each required field in the schema to check if those fields are included in the record entry. If all required fields are present, it returns the recorded entered. If the required fields are not found, it returns undefined. Any fields in the entry that are not required by the schema are passed through to the returned record.
   *
   * @param {object} entry New record to write to database in JSON format. Must contain required fields defined in schema.
   * @returns record entered by the user or undefined
   */
  sanitize(entry) {

    let valid = true;
    let record = {};

    Object.keys(this.schema).forEach( field => {
      if ( this.schema[field].required ) {
        if (entry[field]) {
          record[field] = entry[field];
        } else {
          valid = false;
        }
      }
      else {
        record[field] = entry[field];
      }
    });
    
    return valid ? record : undefined;
  }
  
  /**
   * Gives the number of collections in a database
   *
   * @returns {integer} the length of the database array
   */
  count() {
    return this.database.length;
  }

  /**
   * Mocks an http GET request for an individual record (by id) or a list of all records if no id is provided.
   *
   * @param {string} id Unique identifier of an individual record (UUID format)
   * @returns {object} Resolves a promise with the records found in the database in JSON format
   */
  get(id) {
    const records = id ? this.database.filter( (record) => record._id === id ) : this.database;
    return Promise.resolve(records);
  }

  /**
   * Mocks an http POST request to create a new record in the memory database.
   *
   * @param {object} entry New record to write to database in JSON format. Must contain required fields defined in schema (passes through santize method).
   * @returns {object} Resolves a promise with the record written to the database in JSON format
   */
  post(entry) {
    entry._id = uuid();
    let record = this.sanitize(entry);
    if ( record._id ) { this.database.push(record); }
    return Promise.resolve(record);
  }

  /**
   * Makes an http DELETE request to destroy an existing record in the database
   *
   * @param {string} id Unique identifier of an individual record (UUID format)
   * @returns {object} Empty object to indicate that record was successfully deleted.
   */
  delete(id) {
    this.database = this.database.filter((record) => record._id !== id );
    return this.get(id);
  }

  /**
   * Mocks an http PUT request to edit an existing record in the database
   * @param  {string} id Unique identifier of an individual record (UUID format)
   * @param  {object} record Updated record to write to database in JSON format. Must contain required fields defined in schema.
   * @returns {object} Updated record from the database 
   */
  put(id, entry) {
    let record = this.sanitize(entry);
    if( record._id ) { this.database = this.database.map((item) => (item._id === id) ? record : item  ); }
    return this.get(id);
  }
  
}

module.exports = Model;