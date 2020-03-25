const dbConfig = require('./DynamoDbConfig')(process.env);
const dbConn = require('./DynamoDbConnection')(dbConfig);
const dbGateway = require('./gateways/dynamo')(dbConn);

const saveDropbox = require('./use-cases/SaveDropbox')({
  gateways: {
    dbGateway
  }
});

module.exports = {
  saveDropbox
};
