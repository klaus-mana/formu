const express    = require('express');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const config= require('./config');

const app = express();

const User = require('./db/User.Schema')

app.use(express.static('./public'));
app.use(bodyParser.json());

const mongodb_url = config.mongodb_url;
const port        = config.port;
mongoose.connect(mongodb_url);

//===========AUTH API ENDPOINTS===========//
app.post('/auth/register', async (req, res) => {
    if (!req?.body?.username || !req?.body?.password || !req?.body?.email) res.status(403).send('Invalid Parameters.');

    const existing = await User.findOne({username: req.username});
    if (existing) res.status(403).send('Username already exists.');

    try {
        const user = new User({username: req.body.username, email: req.body.email});
        user.setPassword(req.body.password);
        await user.save();
        const token = {user_id: user._id};
        res.status(200).send(JSON.stringify(token));
    } catch (err) {
        console.log(`\n💥 Server Error in /auth/register: ${err}\n`);
        res.status(500).send('Server Error when creating the User.');
    }
});

app.post('/auth/login', async (req, res) => {
    if (!req.body.username || !req.body.password) res.status(403).send('Invalid Parameters.');

    try {
        console.log(req.body.username);
        const user = await User.findOne({username: req.body.username});
        if (!user) res.status(403).send('Username and/or Password Incorrect.');
        const correctPass = user.loginWith(req.body.password);
        if (!correctPass) {
            res.status(403).send('Username and/or Password Incorrect.');
            return;
        }

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

app.listen(port, ()  => {
    console.log(`🟢 Listening on ${port}`);
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