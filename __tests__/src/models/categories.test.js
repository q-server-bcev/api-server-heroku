'use strict';

const rootDir = process.cwd();
const categories = require(`${rootDir}/src/models/categories/categories-model.js`);

const supergoose = require('../../supergoose.js');

beforeAll(supergoose.startDB);
afterAll(supergoose.stopDB);

describe('Categories Model', () => {
  it('tests are wired', () => {
    expect(true).toBeTruthy();
  });
});