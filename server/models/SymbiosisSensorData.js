
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let SymbiosisSensorData = new Schema({
    sessionId : String,
    readingType: String,
    value: Number,
    timestamp: Date,
    sessionType : String,
    isSummary : Number,
    isUser : Number,
    userNumber : Number,
    userId : String
});

module.exports = mongoose.model('SymbiosisSensorData', SymbiosisSensorData);