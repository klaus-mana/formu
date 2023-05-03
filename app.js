const express    = require('express');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const config= require('./config');

const app = express();

const User = require('./db/User.Schema');
const Formula = require('./db/Formula.Schema');

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

    const user = await User.findOne({_id: req.token.user_id});
    if (user) res.status(200).send(req.token);

    res.status(403).send('No User Authenticated');
});

app.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findOne({_id: req.token.id});
        res.status(200).send(JSON.stringify(user));
    } catch (e) {
        console.log(`\n💥 Server Error in /user/${req.params.id}: ${err}\n`);
        res.status(500).send('Server Error when trying to get user');
    }
});

app.get('/user/:id/formulas', async (req, res) => {
    try {
        const user = await User.findOne({_id: req.token.id});
        const formulas = await user.formulas.map(async (id) => {
            return Formula.findOne({_id: id});
        });

        res.status(200).send(JSON.stringify(formulas));
    } catch (e) {
        console.log(`\n💥 Server Error in /user/${req.params.id}/formulas: ${err}\n`);
        res.status(500).send('Server Error when trying to get formulas');
    }
});

app.patch('/user/:id/save', async (req, res) => {
    if (!req.body.form_id) res.status(403).send('Invalid Parameters.');

    try {
        const user = await User.findOne({_id: req.params.id});
        user.formulas.append(req.body.form_id);
        await user.save();
        res.status(203).send();
    } catch (e) {
        console.log(`\n💥 Server Error in /user/${req.params.id}/save: ${err}\n`);
        res.status(500).send('Server Error when trying to save a formula');
    }
});

app.delete('/user/:id/remove', async (req, res) => {
    if (!req.body.form_id) res.status(403).send('Invalid Parameters.');

    try {
        const user = await User.findOne({_id: req.params.id});
        user.formulas = user.formulas.filter((id) => id !== req.body.form_id);
        await user.save();
        res.status(203).send();
    } catch (e) {
        console.log(`\n💥 Server Error in /user/${req.params.id}/remove: ${err}\n`);
        res.status(500).send('Server Error when trying to remove a formula');
    }
});

app.listen(port, ()  => {
    console.log(`🟢 Listening on ${port}`);
});