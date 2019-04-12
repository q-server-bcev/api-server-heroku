'use strict';

const rootDir = process.cwd();
const supergoose = require('../../supergoose.js');
const { server } = require(`${rootDir}/src/app.js`);
const v1 = require(`${rootDir}/src/api/v1.js`);
const mockRequest = supergoose.server(server);

beforeAll(supergoose.startDB);
afterAll(supergoose.stopDB);

describe('v1.js', () => {
  it('tests are wired', () => {
    expect(true).toBeTruthy();
  });
});