const express = require('express');
const app = express();
const basicAuth = require('express-basic-auth')

const users = {
    admin: 'admin',
    user: 'user'
};

function auth(request) {
    var data = (request.get('authorization') || ':').replace('Basic ', '');
    data = Buffer.from(data, 'base64').toString().split(':', 2);
    var user = {
        name: data[0],
        password: data[1] || ''
    };
    return user;
}

app.use((request, response, next) => {
  var user = auth(request);
  if (!user || !users[user.name] || users[user.name] !== user.password) {
    response.set('WWW-Authenticate', 'Basic realm="Vos identifiants"');
    return response.status(401).send('Access denied');
  }
  return next();
});

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(3000);
