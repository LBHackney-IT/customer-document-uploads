module.exports = options => {
  const { client, tables } = options;

  return {
    createDropbox: async Item => {
      return await client
        .put({
          TableName: tables.dropboxesTable,
          Item
        })
        .promise();
    },
    getDropbox: async dropboxId => {
      return (
        await client
          .get({
            TableName: tables.dropboxesTable,
            Key: { dropboxId }
          })
          .promise()
      ).Item;
    },
    getDropboxes: async dropboxId => {
      return (
        await client
          .scan({
            TableName: tables.dropboxesTable
          })
          .promise()
      ).Items;
    },
    deleteDocument: async (dropboxId, documentId) => {
      await client
        .update({
          TableName: tables.dropboxesTable,
          Key: { dropboxId },
          ExpressionAttributeNames: {'#documentId': documentId},
          UpdateExpression: 'REMOVE uploads.#documentId'
        })
        .promise()
    },
    updateDropbox: async (dropboxId, data) => {
      const updateExpressionItems = [];
      const ExpressionAttributeNames = {};
      const ExpressionAttributeValues = {};
      Object.keys(data).forEach(attr => {
        if (attr !== 'uploads') {
          updateExpressionItems.push(`#key${attr} = :val${attr}`);
          ExpressionAttributeNames[`#key${attr}`] = attr;
          ExpressionAttributeValues[`:val${attr}`] = data[attr];
        }
      });

      if (data.uploads && Object.keys(data.uploads).length > 0) {
        Object.keys(data.uploads).forEach(uploadId => {
          if (data.uploads[uploadId].fileName) {
            // This is a new upload
            updateExpressionItems.push(
              `uploads.#key${uploadId} = :val${uploadId}`
            );
            ExpressionAttributeNames[`#key${uploadId}`] = uploadId;
            ExpressionAttributeValues[`:val${uploadId}`] =
              data.uploads[uploadId];
          } else if (
            data.uploads[uploadId].title &&
            data.uploads[uploadId].title !== ''
          ) {
            // Update an existing upload
            updateExpressionItems.push(
              `uploads.#key${uploadId}.title = :val${uploadId}`
            );
            ExpressionAttributeNames[`#key${uploadId}`] = uploadId;
            ExpressionAttributeValues[`:val${uploadId}`] =
              data.uploads[uploadId].title;
          }
        });
      }

      const params = {
        TableName: tables.dropboxesTable,
        Key: { dropboxId },
        ExpressionAttributeValues,
        ExpressionAttributeNames,
        UpdateExpression: 'SET ' + updateExpressionItems.join(', ')
      };

      await client.update(params).promise();
    }
  };
};
