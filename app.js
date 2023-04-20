const express    = require('express');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const configKeys = require('./config');

const app = express();

const User = require('./db/User.Schema')

app.use(express.static('./public'));
app.use(bodyParser.json());

const mongodb_url = config.mongodb_url;
const port        = config.port;

//===========AUTH API ENDPOINTS===========//
app.post('/auth/register', async (req, res) => {
    if (!req.username || !req.password || !req.email) res.status(403).send('Invalid Parameters.');

    const existing = await User.findOne({username: req.username});
    if (existing) res.status(403).send('Username already exists.');

    try {
        const user = new User({username: req.username, email: req.email});
        user.setPassword(req.password);
        await user.save();
        const token = {user_id: user._id};
        res.status(200).send(JSON.stringify(token));
    } catch (err) {
        console.log(`\n💥 Server Error in /auth/register: ${err}\n`);
        res.status(500).send('Server Error when creating the User.');
    }
});

app.post('/auth/login', async (req, res) => {
    if (!req.username || !req.password) res.status(403).send('Invalid Parameters.');

    try {
        const user = await User.findOne({username: req.username});
        if (!user) res.status(403).send('Username and/or Password Incorrect.');
        const correctPass = user.loginWith(req.password);
        if (!correctPass) res.status(403).send('Username and/or Password Incorrect.');

        const token = {user_id: user._id};
        res.status(200).send(JSON.stringify(token));
    } catch (err) {
        console.log(`\n💥 Server Error in /auth/login: ${err}\n`);
        res.status(500).send('Server Error when trying to log in.');
    }
});

app.get('/auth/check', async (req, res) => {
    if (!req.token) res.status(403).send('Invalid Parameters.');

    const user = await Users.findOne({_id: req.token.user_id});
    if (user) res.status(200).send(req.token);

    res.status(403).send('No User Authenticated');
});

//===========CLIENT ROUTES===========//
/*
app.get('/', (req, res) => {

});

app.get('/explore', (req, res) => {

});

app.get('/formulas', (req, res) => {

});

app.get('/formulas/:id', (req, res) => {

});
*/