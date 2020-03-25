module.exports = options => {
  const { client, tables } = options;

  return {
    updateDropbox: async (dropboxId, data) => {
      const updateExpressionItems = [];
      const ExpressionAttributeNames = {};
      const ExpressionAttributeValues = {};
      Object.keys(data).forEach(attr => {
        updateExpressionItems.push(`#key${attr} = :val${attr}`);
        ExpressionAttributeNames[`#key${attr}`] = attr;
        ExpressionAttributeValues[`:val${attr}`] = data[attr];
      });

      await client
        .update({
          TableName: tables.dropboxesTable,
          Key: { dropboxId },
          ExpressionAttributeValues,
          ExpressionAttributeNames,
          UpdateExpression: 'SET ' + updateExpressionItems.join(', ')
        })
        .promise();
    }
  };
};
