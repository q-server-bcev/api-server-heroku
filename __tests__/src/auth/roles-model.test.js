'use strict';

const rootDir = process.cwd();
const roles = require(`${rootDir}/src/auth/roles-model.js`);

const supergoose = require('../../supergoose.js');

beforeAll(supergoose.startDB);
afterAll(supergoose.stopDB);

describe('Auth Roles Model', () => {
  it('tests are wired', () => {
    expect(true).toBeTruthy();
  });
});