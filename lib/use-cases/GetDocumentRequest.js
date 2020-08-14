module.exports = ({ gateways: { request } }) => {
  return async requestId => {
    const docRequest = await request.get(requestId);
    if (!docRequest) return null;
    return docRequest;
  };
};
