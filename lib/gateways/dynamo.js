

module.exports = (options) => {
    const { client, tables } = options;

    return {
        updateDropbox: (id, data) => {
            const updateExpressionItems = [];
            const ExpressionAttributeNames = {};
            const ExpressionAttributeValues = {};
            Object.keys(data).forEach(attr => {
                if(attr !== 'customerId'){
                updateExpressionItems.push(`#key${attr} = :val${attr}`);
                ExpressionAttributeNames[`#key${attr}`] = attr;
                ExpressionAttributeValues[`:val${attr}`] = data[attr];
                }
            })

            await config.client.update({
                TableName: config.tables.customersTable,
                Key: { customerId },
                ExpressionAttributeValues,
                ExpressionAttributeNames,
                UpdateExpression: 'SET ' + updateExpressionItems.join(', ')
            }).promise();
        }
    }
}