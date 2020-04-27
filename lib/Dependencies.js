const path = require('path');
const dbConfig = require('./DynamoDbConfig')(process.env);
const dbConn = require('./DynamoDbConnection')(dbConfig);
const dbGateway = require('./gateways/dynamo')(dbConn);
const s3Config = require('./s3Config')(process.env);
const s3Gateway = require('./gateways/s3')(s3Config);
const { loadTemplates, generateRandomString } = require('./utils');
const { getSession, createSessionToken } = require('./sessions');
const templates = loadTemplates(path.join(__dirname, '../templates'));
const authorize = require('./authorize');

const container = {
  gateways: {
    dropbox: require('./gateways/dropbox/dynamodb')(dbConn),
    document: require('./gateways/document/s3')(s3Config)
  }
};

const saveFile = require('./use-cases/SaveFile')({
  gateways: {
    s3Gateway
  }
});

const saveDropbox = require('./use-cases/SaveDropbox')({
  gateways: {
    dbGateway
  },
  useCases: { saveFile }
});

const getDropbox = require('./use-cases/GetDropbox')(container);

const getDropboxes = require('./use-cases/GetDropboxes')({
  gateways: {
    dbGateway
  }
});

const createEmptyDropbox = require('./use-cases/CreateEmptyDropbox')(container);

const deleteDocument = require('./use-cases/DeleteDocument')({
  gateways: {
    dbGateway,
    s3Gateway
  }
});

const getSecureUploadUrl = require('./use-cases/GetSecureUploadUrl')(container);

module.exports = {
  getDropbox,
  saveDropbox,
  getDropboxes,
  createEmptyDropbox,
  saveFile,
  deleteDocument,
  generateRandomString,
  getSession,
  createSessionToken,
  getSecureUploadUrl,
  templates,
  authorize
};
