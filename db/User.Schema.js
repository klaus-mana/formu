const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: String,
    password: String,
    formulas: [String]
});

module.exports = mongoose.model('User', userSchema);