module.exports = ({ gateways: { request } }) => {
  return async docRequest => {
    await request.update(docRequest);
  };
};
