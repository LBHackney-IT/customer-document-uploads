const path = require('path');
const dbConfig = require('./DynamoDbConfig')(process.env);
const dbConn = require('./DynamoDbConnection')(dbConfig);
const s3Config = require('./s3Config')(process.env);
const { loadTemplates, generateRandomString } = require('./utils');
const { getSession, createSessionToken } = require('./sessions');
const templates = loadTemplates(path.join(__dirname, '../templates'));
const authorize = require('./authorize');
const log = require('./log')();

const configuration = {
  urlPrefix: process.env.URL_PREFIX,
  maxUploadBytes: parseInt(process.env.MAX_UPLOAD_BYTES) || 20_971_520
};

const container = {
  log,
  configuration,
  gateways: {
    dropbox: require('./gateways/dropbox/dynamodb')({ ...dbConn, log }),
    document: require('./gateways/document/s3')({
      ...s3Config,
      log,
      configuration
    })
  }
};

const getDropbox = require('./use-cases/GetDropbox')(container);
const getDropboxes = require('./use-cases/GetDropboxes')(container);
const createEmptyDropbox = require('./use-cases/CreateEmptyDropbox')(container);
const deleteDocument = require('./use-cases/DeleteDocument')(container);
const getSecureUploadUrl = require('./use-cases/GetSecureUploadUrl')(container);
const saveDropbox = require('./use-cases/SaveDropbox')(container);

module.exports = {
  getDropbox,
  getDropboxes,
  createEmptyDropbox,
  deleteDocument,
  saveDropbox,
  generateRandomString,
  getSession,
  createSessionToken,
  getSecureUploadUrl,
  templates,
  authorize
};
