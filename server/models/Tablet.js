/**
 * Created by bisho on 04/05/2019.
 */

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let tablet = new Schema({
    tabletId: String,
    type: String,
    isTaken: Boolean
});

module.exports = mongoose.model('Tablet', tablet);