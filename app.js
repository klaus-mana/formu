/*
    File: app.js
    Project: FormU CSC 337 Final Project
    Author: Klaus Mana
    Purpose: Serverside JS for function, user, and auth API endpoints. 
*/
const express    = require('express');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const config     = require('./config');
const utils      = require('./utils');
const multer     = require('multer');
const session    = require('express-session');

const app = express();

const multerStorage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './csv_files');
    },
    filename: function(req, file, cb) {
      cb(null, `${req.session.user_id}-${file.originalname}`);
    }
  });
const upload = multer({ storage: multerStorage });

const User = require('./db/User.Schema');
const Formula = require('./db/Formula.Schema');

app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(session({
    secret: config.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

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
        
        req.session.user_id = user._id;
        res.status(200).send(JSON.stringify(user._id));
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

        req.session.user_id = user._id;
        res.status(200).send(JSON.stringify(user._id));
    } catch (e) {
        console.log(`\n💥 Server Error in /auth/login: ${e}\n`);
        res.status(500).send('Server Error when trying to log in.');
    }
});

app.get('/auth/check', (req, res) => {
    if (!req.session.user_id) res.status(403).send('EXPIRED');
    res.status(200).send(req.session.user_id);
});

app.get('/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) { console.log(err) } else { res.redirect('/') }
    });
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
    if (req.params.id == "EXPIRED") return;

    try {
        const user = await User.findOne({_id: req.params.id});
        const formulas = [];
        for (id of user.formulas) {
            const formula = await Formula.findOne({_id: id});
            formulas.push(formula);
        }

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
        user.formulas.push(req.body.form_id);
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

app.get('/formula/search/:term', async (req, res) => {
    let results = []

    for (curTerm of req.params.term.split(' ')) {
        const regex = new RegExp(curTerm, 'i');

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
            console.log(`\n💥 Server Error in /formula/search/${req.params.term}: ${e}\n`);
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

app.post('/formula/:id/run/simple', async (req, res) => {
    try {
        const formula = await Formula.findOne({_id: req.params.id});
        const start_problem = formula.raw_latex.indexOf("(");
        const end_problem = formula.raw_latex.length - 2;
        const run_eqn = formula.raw_latex.substring(start_problem+1, end_problem).trim();

        const runnable = utils.getRunnable(run_eqn); //Lexer whatever is here, fixed with above string formatting
        const result = runnable(req.body);//now getting: mc not numbers here, this was due to not having *
        res.status(200).send(JSON.stringify(result));
    } catch (e) {
        console.log(`\n💥 Server Error in /formula/${req.params.id}/run/simple: ${e}\n`);
        res.status(500).send('Server Error when trying to run a formula');
    }
});

app.post('/formula/:id/run/file', async (req, res) => {
    upload.single('file')(req, res, async (e) => {
        if (e) {
            console.log(`\n💥 Server Error in /formula/${req.params.id}/run/file: ${e}\n`);
            res.status(500).send('Error Uploading File');
        }

        try {
            const formula = await Formula.findOne({_id: req.params.id});
            const vars = await utils.getInput(`./csv_files/${req.file.filename}`);

            const start_problem = formula.raw_latex.indexOf("(");
            const end_problem = formula.raw_latex.length - 2;
            const run_eqn = formula.raw_latex.substring(start_problem+1, end_problem).trim();

            const outfile = await utils.getOutput(run_eqn, vars, `./csv_files/${req.file.filename}`);

            res.download(outfile, (e) => {
                if (e) {
                    console.log(`\n💥 Server Error in /formula/${req.params.id}/run/file: ${e}\n`);
                } else {
                    utils.cleanup(`./csv_files/${req.file.filename}`);
                }
            });
        } catch (e) {
            console.log(`\n💥 Server Error in /formula/${req.params.id}/run/file: ${e}\n`);
            res.status(500).send('Error Getting Results');
        }
    });
});

app.listen(port, async ()  => {
    console.log(`🟢 Listening on ${port}`);
});