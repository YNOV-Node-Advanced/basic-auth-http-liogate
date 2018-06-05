const express = require('express');
const uuidv4 = require('uuid/v4');
const cookieParser = require('cookie-parser');
const app = express();
const SECRET = 'a_very_strong_password';
const COOKIE_KEY = 'CUSTOM_SESSID';

const users = {
    admin: 'admin',
    user: 'user'
};

const sessionStorage = {
    get: (id, key) => {
        if (sessionStorage.data.hasOwnProperty(id)) {
            return sessionStorage.data[id][key];
        }
    },
    set: (id, key, value) => {
        if (!sessionStorage.data.hasOwnProperty(id)) {
            sessionStorage.data[id] = {};
        }
        sessionStorage.data[id][key] = value;
    },
    data: {}
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
app.use(cookieParser(SECRET));
app.use((request, response, next) => {
    var user = auth(request);
    if (!user || !users[user.name] || users[user.name] !== user.password) {
        response.set('WWW-Authenticate', 'Basic realm="Vos identifiants"');
        return response.status(401).send('Access denied');
    }
    if(!cookieParser.signedCookie(COOKIE_KEY, SECRET)) {
        response.cookie(COOKIE_KEY, uuidv4(), {signed: true});
    }
    return next();
});

app.get('/', function (req, res) {
    const id = req.signedCookies[COOKIE_KEY];
    if (!sessionStorage.get(id, 'mySessionVar')) {
        sessionStorage.set(id, 'mySessionVar', Math.floor(Math.random()*1000));
    }
    res.send('Session var: ' + sessionStorage.get(id, 'mySessionVar'));
});

app.listen(3000);
