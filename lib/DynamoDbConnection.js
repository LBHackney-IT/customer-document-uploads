const AWS = require('aws-sdk');

module.exports = ({ dbConfig, tables }) => {
  const client = new AWS.DynamoDB.DocumentClient(dbConfig);

  return {
    client,
    tables,
    configuration: { tables }
  };
};
