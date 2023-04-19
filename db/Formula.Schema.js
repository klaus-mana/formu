const mongoose = require('mongoose');
const { Schema } = mongoose;

const formulaSchema = new Schema({
    name: String,
    description: String,
    raw_latex: String,
    user_id: String
});

module.exports = mongoose.model('Formula', formulaSchema);