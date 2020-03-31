module.exports = options => {
  const { client, bucket } = options;

  return {
    saveFile: async (Key, Body) => {
      return await client
        .putObject({
          Bucket: bucket,
          Key,
          Body
        })
        .promise();
    },
    getDownloadUrl: async (dropboxId, fileId, fileName) => {
      return await client.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: `${dropboxId}/${fileId}/${fileName}`,
        Expires: 60
      });
    },
    deleteDocument: async Key => {
      return await client
        .deleteObject({
          Bucket: bucket,
          Key
        })
        .promise();
    }
  };
};
