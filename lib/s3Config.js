const AWS = require('aws-sdk');

module.exports = env => {
  const bucket = process.env.UPLOADS_BUCKET;
  const s3Config = { s3ForcePathStyle: true };
  if (env.stage === 'dev' || env.stage === 'test') {
    s3Config.s3ForcePathStyle = true;
    s3Config.endpoint = new AWS.Endpoint('http://localhost:8100');
    s3Config.accessKeyId = 'S3RVER';
    s3Config.secretAccessKey = 'S3RVER';
  }
  const client = new AWS.S3(s3Config);
  return { client, bucket, bucketName: bucket };
};
