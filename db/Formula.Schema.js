const mongoose = require('mongoose');
const { Schema } = mongoose;

const formulaSchema = new Schema({
    name: String,
    description: String,
    raw_latex: String
});

module.exports = mongoose.model('Formula', formulaSchema);