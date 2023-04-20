const mongoose = require('mongoose');
const { Schema } = mongoose;

const crypto = require('crypto');

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: String,
    password: String,
    salt: String,
    formulas: [String],
    saved:    [String]
});

userSchema.methods.setPassword = (raw_pass) => {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.password = crypto.createHash('sha256').update(raw_pass + salt).digest('hex');
};

userSchema.methods.loginWith = (password) => {
    const pass = crypto.createHash('sha256').update(password + this.salt).digest('hex');
    return this.password == pass;
}

module.exports = mongoose.model('User', userSchema);