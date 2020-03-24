module.exports = (env) => {
  const dbConfig = {}
  const tables = {
    customersTable: env.UPLOADS_TABLE
  };

  if (env.IS_OFFLINE) {
    dbConfig.region = 'localhost';
    dbConfig.endpoint = 'http://localhost:8000';
    dbConfig.accessKeyId = 'AWS_ACCESS_KEY_ID';
    dbConfig.secretAccessKey = 'AWS_SECRET_ACCESS_KEY';
  } else if (env.JEST_WORKER_ID) {
    dbConfig.region = 'localhost';
    dbConfig.endpoint = 'http://localhost:8100';
    dbConfig.sslEnabled = false;
    dbConfig.accessKeyId = 'AWS_ACCESS_KEY_ID';
    dbConfig.secretAccessKey = 'AWS_SECRET_ACCESS_KEY';
  }
  return { dbConfig, tables }
}
