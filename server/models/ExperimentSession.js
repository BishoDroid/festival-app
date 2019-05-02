/**
 * Created by bisho on 14/04/2019.
 * This session will contain the data of the two users participating in one session
 * and the level of harmony reached between them
 */

var mongoose = require('mongoose');
var user = {
    participantsNumber : Number,
    age: Number,
    preQuest: {
        age: Number,
        gender: String,
        connectionWithOthersScale: Number,
        tuningWithPeopleScale: Number,
        happinessScale: Number,
        lonelinessScale: Number
    },
    data: [{
        readingType: String,
        value: Number,
        timestamp: Date
    }],
    postQuest: {
        singingPartnerFamiliarity: String,
        symbiosisRoomFamiliarity: String,
        connectionWithOthersScale: Number,
        tuningWithPeopleScale: Number,
        happinessScale: Number,
        lonelinessScale: Number
    }
};

module.exports = mongoose.model('ExperimentSession', {
    experimentType : String,
    sessionId: String,
    users : [user],
    user1: user,
    harmonyData: [{
        readingType: String,
        value: Number,
        timestamp: Date
    }],
    user2: user,
    timestamp: Date,
    active: Number,
    preCompleted: 0,
    postCompleted: 0
});
