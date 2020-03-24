'use strict';
const util = require('util');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

module.exports = (config) => {
  const client = new AWS.DynamoDB.DocumentClient(config.dbConfig);

  return { client, tables: config.tables };
}

