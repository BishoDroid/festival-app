/**
 * Created by bisho on 14/04/2019.
 */

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let user = new Schema({
    participantsNumber : Number,
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
