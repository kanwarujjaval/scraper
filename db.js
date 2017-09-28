const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/scraper', { useMongoClient: true });

const linkSchema = new mongoose.Schema({
    link: { type: String, unique: true }
}, { strict: false, timestamps: true });
const prodSchema = new mongoose.Schema({
    link: { type: String, unique: true }
}, { strict: false, timestamps: true });

exports.links = mongoose.model('link', linkSchema);
exports.prods = mongoose.model('prod', prodSchema);