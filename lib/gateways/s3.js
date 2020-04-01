module.exports = options => {
  const { client, bucket } = options;

  const log = (funcName, value) => {
    console.log(`${funcName}: `);
    console.log(value);
  };

  const getFile = async Key => {
    try {
      const params = {
        Bucket: bucket,
        Key
      };
      log('getFile', params);
      return await client.getObject(params).promise();
    } catch (err) {}
  };

  const saveFile = async (Key, Body) => {
    try {
      const params = {
        Bucket: bucket,
        Key,
        Body
      };
      log('saveFile', params);
      await client.putObject().promise();

      const obj = await client
        .getObject({
          Bucket: bucket,
          Key
        })
        .promise();
      console.log(obj);
    } catch (err) {}
  };

  const getDownloadUrl = async (dropboxId, fileId, fileName) => {
    const params = {
      Bucket: bucket,
      Key: `${dropboxId}/${fileId}/${fileName}`,
      Expires: 60
    };
    log('getDownloadUrl', params);
    return await client.getSignedUrl('getObject', params);
  };

  const deleteDocument = async Key => {
    const params = {
      Bucket: bucket,
      Key
    };
    log('deleteDocument', params);
    await client.deleteObject(params).promise();
  };

  return {
    getFile,
    saveFile,
    getDownloadUrl,
    deleteDocument
  };
};
