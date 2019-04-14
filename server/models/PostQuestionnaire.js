/**
 * Created by bisho on 14/04/2019.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postQuestionnaire = new Schema({
    singingPartnerFamiliarity: String,
    symbiosisRoomFamiliarity: String,
    connectionWithOthersScale: Number,
    tuningWithPeopleScale: Number,
    happinessScale: Number,
    lonelinessScale: Number
});

module.exports = mongoose.model('PostQuestionnaire', postQuestionnaire);
