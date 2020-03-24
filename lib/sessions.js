const jwtSecret = process.env.jwtsecret;
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

module.exports = {
    getSession: headers => {
        if(headers['Cookie']){
            cookies = cookie.parse(headers['Cookie']);
            if(cookies.customerToken){
                return jwt.verify(cookies.customerToken, jwtSecret)
            }
        }
        return false;
    },

    createSessionCookie: dropboxId => {
        const token = jwt.sign({dropboxId}, jwtSecret);
        return cookie.serialize('customerToken', token, {maxAge: (86400 * 30)});
    }
}