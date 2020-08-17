const path = require('path');
const dbConfig = require('./DynamoDbConfig')(process.env);
const dbConn = require('./DynamoDbConnection')(dbConfig);
const s3Config = require('./s3Config')(process.env);
const { loadTemplates, generateRandomString } = require('./utils');
const { getSession, createSessionToken } = require('./sessions');
const templates = loadTemplates(path.join(__dirname, '../templates'));
const authorize = require('./authorize');
const log = require('./log')();
const EvidenceStoreGateway = require('./gateways/document/EvidenceStoreGateway');
const { NotifyClient } = require('notifications-node-client');

const configuration = {
  urlPrefix: process.env.URL_PREFIX,
  evidenceStoreUrl: process.env.EVIDENCE_STORE_URL,
  evidenceStoreToken: process.env.EVIDENCE_STORE_TOKEN,
  maxUploadBytes: parseInt(process.env.MAX_UPLOAD_BYTES) || 20_971_520
};

var notifyClient = new NotifyClient(process.env.GOV_NOTIFY_API_KEY);

const container = {
  log,
  configuration,
  gateways: {
    dropbox: require('./gateways/dropbox/dynamodb')({ ...dbConn, log }),
    document: require('./gateways/document/s3')({
      ...s3Config,
      log,
      configuration
    }),
    evidenceStore: new EvidenceStoreGateway({
      baseUrl: configuration.evidenceStoreUrl,
      authorizationToken: configuration.evidenceStoreToken
    }),
    notify: require('./gateways/notification/govNotify')({
      client: notifyClient,
      log
    }),
    request: require('./gateways/request/dynamodb')({ ...dbConn, log })
  }
};

const getDropbox = require('./use-cases/GetDropbox')(container);
const getDropboxes = require('./use-cases/GetDropboxes')(container);
const createEmptyDropbox = require('./use-cases/CreateEmptyDropbox')(container);
const deleteDocument = require('./use-cases/DeleteDocument')(container);
const getSecureUploadUrl = require('./use-cases/GetSecureUploadUrl')(container);
const saveDropbox = require('./use-cases/SaveDropbox')(container);
const getEvidenceStoreUrl = require('./use-cases/GetEvidenceStoreUrl')(
  container
);
const getResolvedDownloadUrl = require('./use-cases/GetResolvedDownloadUrl')(
  container
);
const createDocumentRequest = require('./use-cases/CreateDocumentRequest')(
  container
);
const getDocumentRequest = require('./use-cases/GetDocumentRequest')(container);
const updateDocumentRequest = require('./use-cases/UpdateDocumentRequest')(
  container
);
const updateArchiveStatus = require('./use-cases/UpdateArchiveStatus')(
  container
);
const sendNotification = require('./use-cases/SendNotification')(container);

module.exports = {
  createDocumentRequest,
  getDocumentRequest,
  updateDocumentRequest,
  getDropbox,
  getDropboxes,
  createEmptyDropbox,
  deleteDocument,
  saveDropbox,
  generateRandomString,
  getSession,
  createSessionToken,
  getEvidenceStoreUrl,
  getSecureUploadUrl,
  getResolvedDownloadUrl,
  templates,
  authorize,
  updateArchiveStatus,
  sendNotification
};
