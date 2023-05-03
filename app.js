const express    = require('express');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const config     = require('./config');
const utils      = require('./utils');

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
    } catch (e) {
        console.log(`\n💥 Server Error in /auth/register: ${e}\n`);
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
    } catch (e) {
        console.log(`\n💥 Server Error in /auth/login: ${e}\n`);
        res.status(500).send('Server Error when trying to log in.');
    }
});

app.get('/auth/check', async (req, res) => {
    if (!req.token) res.status(403).send('Invalid Parameters.');

    const user = await User.findOne({_id: req.token.user_id});
    if (user) res.status(200).send(req.token);

    res.status(403).send('No User Authenticated');
});

//===========USER API ENDPOINTS===========//
app.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findOne({_id: req.params.id});
        res.status(200).send(JSON.stringify(user));
    } catch (e) {
        console.log(`\n💥 Server Error in /user/${req.params.id}: ${e}\n`);
        res.status(500).send('Server Error when trying to get user');
    }
});

app.get('/user/:id/formulas', async (req, res) => {
    try {
        const user = await User.findOne({_id: req.params.id});
        const formulas = await user.formulas.map(async (id) => {
            return Formula.findOne({_id: id});
        });

        res.status(200).send(JSON.stringify(formulas));
    } catch (e) {
        console.log(`\n💥 Server Error in /user/${req.params.id}/formulas: ${e}\n`);
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
        console.log(`\n💥 Server Error in /user/${req.params.id}/save: ${e}\n`);
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
        console.log(`\n💥 Server Error in /user/${req.params.id}/remove: ${e}\n`);
        res.status(500).send('Server Error when trying to remove a formula');
    }
});

//===========FORMULA API ENDPOINTS===========//
app.get('/formula/:id', async (req, res) => {
    try {
        const formula = await Formula.findOne({_id: req.params.id});
        res.status(200).send(JSON.stringify(formula));
    } catch (e) {
        console.log(`\n💥 Server Error in /formula/${req.params.id}: ${e}\n`);
        res.status(500).send('Server Error when trying to get formula');
    }
});

app.get('/formula/:term', async (req, res) => {
    const results = []

    for (curTerm of req.params.term.split(' ')) {
        const search = new RegExp(curTerm, 'i');

        try {
            const curRes = await Formula.find({
                $and: [
                    {$or: [
                        {name: regex}, {description: regex}, {tags : { $in: [regex] }}
                    ]},
                    { public: true }
                ]
            });

            results = results.concat(curRes);
        } catch (e) {
            console.log(`\n💥 Server Error in /formula/${req.params.term}: ${e}\n`);
            res.status(500).send('Server Error when trying to search for formulas');
        }
    }

    const retval = [...new Set(results)];
    res.status(200).send(retval);
});

app.post('/formula/create', async (req, res) => {
    if (!req.body.user_id || !req.body.raw_latex) res.status(403).send('Invalid Parameters.');
    const {name = 'Untitled Formula', description = '', tags = [], public = true} = req.body;

    try {
        const user = await User.findOne({_id: req.body.user_id});
        const username = user.username;
        const data = {
            name: name,
            description: description,
            raw_latex: req.body.raw_latex,
            user_id: req.body.user_id,
            username: username,
            tags: tags,
            public: public
        };
        const formula = new Formula(data);
        await formula.save();

        res.status(200).send(JSON.stringify(formula));
    } catch (e) {
        console.log(`\n💥 Server Error in /formula/create: ${e}\n`);
        res.status(500).send('Server Error when trying to create a formula');
    }
});

app.patch('/formula/:id/edit', async (req, res) => {
    try {
        const formula = await Formula.findOne({_id: req.params.id});

        const {name = formula.name, description = formula.description,
               tags = formula.tags, public = formula.public, raw_latex=formula.raw_latex} = req.body;
        formula.name = name;
        formula.description = description;
        formula.tags = tags;
        formula.public = public;
        formula.raw_latex = raw_latex;

        await formula.save();

        res.status(200).send(formula);
    } catch (e) {
        console.log(`\n💥 Server Error in /formula/${req.params.id}/edit: ${e}\n`);
        res.status(500).send('Server Error when trying to edit a formula');
    }
});

app.delete('/formula/:id/delete', async (req, res) => {
    try {
        const formula = await Formula.findOneAndDelete({_id: req.params.id});
        res.status(200).send(JSON.stringify(formula));
    } catch (e) {
        console.log(`\n💥 Server Error in /formula/${req.params.id}/delete: ${e}\n`);
        res.status(500).send('Server Error when trying to delete a formula');
    }
});

app.get('/formula/:id/run/simple', async (req, res) => {
    try {
        const formula = await Formula.findOne({_id: req.params.id});
        const runnable = utils.getRunnable(formula.raw_latex);
        const result = runnable(req.body);
        res.status(200).send(JSON.stringify(result));
    } catch (e) {
        console.log(`\n💥 Server Error in /formula/${req.params.id}/run/simple: ${e}\n`);
        res.status(500).send('Server Error when trying to run a formula');
    }
});

app.listen(port, ()  => {
    console.log(`🟢 Listening on ${port}`);
});