/**
 * Created by bisho on 14/04/2019.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var preQuestionnaire = new Schema({
    submissionTime : Date,
    age: Number,
    gender: String,
    connectionWithOthersScale: Number,
    tuningWithPeopleScale: Number,
    happinessScale: Number,
    lonelinessScale: Number
});

module.exports = mongoose.model('PreQuestionnaire', preQuestionnaire);
