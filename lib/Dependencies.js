const dbConfig = require('./DynamoDbConfig')(process.env);
const dbConn = require('./DynamoDbConnection')(dbConfig);
const dbGateway = require('./gateways/dynamo')(dbConn);
const s3Config = require('./s3Config')(process.env);
const s3Gateway = require('./gateways/s3')(s3Config);

const saveFile = require('./use-cases/SaveFile')({
  gateways: {
    s3Gateway
  }
});

const getDownloadUrl = require('./use-cases/GetDownloadUrl')({
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

const getDropbox = require('./use-cases/GetDropbox')({
  gateways: {
    dbGateway
  }
});

const getDropboxes = require('./use-cases/GetDropboxes')({
  gateways: {
    dbGateway
  }
});

const createEmptyDropbox = require('./use-cases/CreateEmptyDropbox')({
  gateways: {
    dbGateway
  }
});

module.exports = {
  getDropbox,
  saveDropbox,
  getDropboxes,
  createEmptyDropbox,
  saveFile,
  getDownloadUrl
};
