/**
 * Created by bisho on 14/04/2019.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user = new Schema({
    userId: Number,
    preQuest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PreQuestionnaire'
    },
    data: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SensorData'
    },
    postQuest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PostQuestionnaire'
    }
});

module.exports = mongoose.model('User', user);
