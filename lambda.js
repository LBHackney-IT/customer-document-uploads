const send = (body) => {
    return {
        statusCode: 200,
        headers: {
        'Content-Type': 'text/html'
        },
        body
    };
}

module.exports = {
    root: async (event) => {
        return send("Hello world");
    }
}