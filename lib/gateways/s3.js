module.exports = options => {
  const { client, bucket } = options;

  return {
    saveFile: async (Key, Body) => {
      return await client.putObject({
        Bucket: bucket,
        Key,
        Body
      }).promise();
    },
  };
};
