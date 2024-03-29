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
    password: {
        type: String,
        required: true
    },
    salt: String,
    formulas: [String],
});

userSchema.methods.setPassword = function(raw_pass) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.password = crypto.createHash('sha256').update(raw_pass + this.salt).digest('hex');
};

userSchema.methods.loginWith = function(password)  {
    const pass = crypto.createHash('sha256').update(password + this.salt).digest('hex');
    return this.password == pass;
}

module.exports = mongoose.model('User', userSchema);