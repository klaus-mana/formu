const express = require('express');
const app     = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.use(express.static('./public'));

const mongoose_url = '';

//===========AUTH API ENDPOINTS===========//
app.post('/auth/register', (req, res) => {

});

app.post('/auth/login', (req, res) => {

});

app.get('/auth/check', (req, res) => {

});

//===========CLIENT ROUTES===========//
app.get('/', (req, res) => {

});

app.get('/explore', (req, res) => {

});

app.get('/formulas', (req, res) => {

});

app.get('/formulas/:id', (req, res) => {

});