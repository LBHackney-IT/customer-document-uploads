const jwt = require('jsonwebtoken');

module.exports = () => {
  const jwt_secret = process.env.jwtsecret;

  const allow = resource => {
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: resource
          }
        ]
      }
    };
  };

  const extractTokenFromAuthHeader = event => {
    if (!(event.headers && event.headers.Authorization)) return null;
    if (event.headers.Authorization.startsWith('Bearer')) {
      return event.headers.Authorization.replace('Bearer ', '');
    }
  };

  const decodeToken = token => {
    try {
      return jwt.verify(token, jwt_secret);
    } catch (err) {
      return false;
    }
  };

  const requestAllowed = async (tokenPayload, event) => {
    if (tokenPayload.path && tokenPayload.methods) {
      return (
        tokenPayload.path === event.path &&
        tokenPayload.methods.indexOf(event.httpMethod.toLowerCase()) >= 0
      );
    }
  };

  return async event => {
    const token = extractTokenFromAuthHeader(event);
    const decodedToken = decodeToken(token);
    if (token && decodedToken && (await requestAllowed(decodedToken, event))) {
      return allow(event.methodArn);
    }
    return 'Unauthorized';
  };
};
