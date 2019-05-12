/**
 * Created by bisho on 11/05/2019.
 */

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let config = new Schema({
    key: String,
    value: String
});

module.exports = mongoose.model('Config', config);