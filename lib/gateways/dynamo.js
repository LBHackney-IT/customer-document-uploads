module.exports = options => {
  const { client, tables } = options;

  return {
    updateDropbox: async (id, data) => {
      const updateExpressionItems = [];
      const ExpressionAttributeNames = {};
      const ExpressionAttributeValues = {};
      Object.keys(data).forEach(attr => {
        if (attr !== 'customerId') {
          updateExpressionItems.push(`#key${attr} = :val${attr}`);
          ExpressionAttributeNames[`#key${attr}`] = attr;
          ExpressionAttributeValues[`:val${attr}`] = data[attr];
        }
      });

      await client
        .update({
          TableName: tables.customersTable,
          Key: { customerId },
          ExpressionAttributeValues,
          ExpressionAttributeNames,
          UpdateExpression: 'SET ' + updateExpressionItems.join(', ')
        })
        .promise();
    }
  };
};
