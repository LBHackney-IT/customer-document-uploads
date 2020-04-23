const logAction = (funcName, value) => {
  console.log(`${funcName}: `);
  console.log(value);
};

module.exports = options => {
  const { client, bucket } = options;

  const getFile = async Key => {
    const params = {
      Bucket: bucket,
      Key
    };
    logAction('getFile', params);
    return await client.getObject(params).promise();
  };

  const saveFile = async (Key, Body) => {
    const params = {
      Bucket: bucket,
      Key
    };
    logAction('saveFile', params);
    params.Body = Body;
    const response = await client.putObject(params).promise();
    console.log(`saveFile response key=${Key}:`);
    console.log(response);
  };

  const getDownloadUrl = async (dropboxId, fileId, fileName) => {
    const params = {
      Bucket: bucket,
      Key: `${dropboxId}/${fileId}/${fileName}`,
      Expires: 60
    };
    logAction('getDownloadUrl', params);
    return await client.getSignedUrl('getObject', params);
  };

  const deleteDocument = async Key => {
    const params = {
      Bucket: bucket,
      Key
    };
    logAction('deleteDocument', params);
    await client.deleteObject(params).promise();
  };

  return {
    getFile,
    saveFile,
    getDownloadUrl,
    deleteDocument
  };
};
