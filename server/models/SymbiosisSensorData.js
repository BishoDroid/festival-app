
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let SymbiosisSensorData = new Schema({
    sessionId : String,
    readingType: String,
    value: Number,
    timestamp: Date
});

module.exports = mongoose.model('SymbiosisSensorData', SymbiosisSensorData);