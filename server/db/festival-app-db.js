/**
 * Created by bisho on 14/04/2019.
 */

var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/festival-app');

module.exports = mongoose;
