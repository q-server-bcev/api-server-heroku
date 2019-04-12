'use strict';

const rootDir = process.cwd();
const users = require(`${rootDir}/src/auth/users-model.js`);

const supergoose = require('../../supergoose.js');

beforeAll(supergoose.startDB);
afterAll(supergoose.stopDB);

describe('Auth Users Model', () => {
  it('tests are wired', () => {
    expect(true).toBeTruthy();
  });
});