module.exports = {
  handler: async () => {
    return {
      statusCode: 302,
      headers: { Location: '/dropboxes/new' }
    };
  }
};
