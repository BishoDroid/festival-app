/**
 * Created by bisho on 26/05/2019.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let log = new Schema({
    time: Date,
    status: String,
    type: String,
    message: String
});

module.exports = mongoose.model('Log', log);