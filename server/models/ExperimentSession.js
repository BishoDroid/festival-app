/**
 * Created by bisho on 14/04/2019.
 * This session will contain the data of the two users participating in one session
 * and the level of harmony reached between them
 */

let mongoose = require('mongoose');
let user = {
    participantsNumber : Number,
    preQuest: {
        submissionTime : Date,
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
        submissionTime : Date,
        singingPartnerFamiliarity: String,
        symbiosisRoomFamiliarity: String,
        connectionWithOthersScale: Number,
        tuningWithPeopleScale: Number,
        happinessScale: Number,
        lonelinessScale: Number
    }
};

module.exports = mongoose.model('ExperimentSession', {
    type : String,
    recordingStartTime : Date,
    recordingStopTime : Date,
    sessionId: String,
    users : [user],
    sessionData: [{
        readingType: String,
        value: Number,
        timestamp: Date
    }],
    timestamp: Date,
    active: Number,
    preCompleted: 0,
    postCompleted: 0
});
