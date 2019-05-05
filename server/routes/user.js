const express = require('express');
const router = express.Router();

require('../db/festival-app-db');
// in memory db for storing sessions temporarily
const lokiSingleton = require('../db/festival-app-db-in-loki');

let db = lokiSingleton.getInstance();

let sessions = db.getCollection('sessions');
let config = db.getCollection('config');

let PreQuestionnaire = require('../models/PreQuestionnaire');
let PostQuestionnaire = require('../models/PostQuestionnaire');
let ExperimentSession = require('../models/ExperimentSession');
let User = require('../models/User');

router.route('/user/remove') // to remove the session by admin

    .post(function (req, res) {
        let sessionId = req.header('session-id');

        let session = sessions.findOne({sessionId: sessionId});
        session.active = 0;

        ExperimentSession.findOneAndUpdate({'_id': session._id}, session, {new: true}, function (err, doc) {
            if (err) return res.json({status: 'ERR', code: 500, msg: err});

            removeInactiveSession(session);
            stopRecordingForSession(session);
            console.log("session: " + session.sessionId + " is removed");
            return res.json({status: 'OK', code: 200, msg: 'Saved data'});

        });
    });

router.route('/user/pre-quest')

/**
 * @method POST
 * Stores a pre-questionnaire for the given user
 */
    .post(function (req, res) {

        let body = req.body;
        let preQuestSchema = convertPreQuestionnaireBodyToSchema(body);
        let clientId = req.header('client-id');
        let session = getLatestSession('desc');
        let sessionType = clientId.includes("entrance") ? 'kima' : 'symbiosis' ;
        let maxNumberOfParticipants = sessionType === 'kima'  ? 3 : 8 ;
        let userNumber = clientId.match(/\d+/)[0] ;
        let userIndex = userNumber -1 ;

        let sessionWithCompletePreQuestionair = session && session.preCompleted === 1 ;
        //check if the context has un complete session
        if (!session || sessionWithCompletePreQuestionair ) { // very first session
            console.log("creating new session");
            let newSession = new ExperimentSession();
            newSession.sessionId = getNextSessionId(sessions);
            processNewPreQuestSession(newSession, clientId, preQuestSchema, res,maxNumberOfParticipants,userIndex);
        }

        else if (session && session.preCompleted === 0) {
            console.log('Found an existing session. only one user updated, updating the second....');
            updateExistingPreQuestSession(session, clientId, preQuestSchema, res,maxNumberOfParticipants,userIndex)
        }
    });

let updateExistingPreQuestSession = function (session, clientId, preQuestSchema, res,maxNumberOfParticipants,userIndex) {

    session.users[userIndex].preQuest = preQuestSchema;
    session.preCompleted = getNumberOfUsersCompletedPreQuestionair(session) == maxNumberOfParticipants ? 1 : 0;
    updateSession(session, res);


};
    function getNextSessionId (sessions) {
        if (sessions.count() === 0 ) {
            return "session-1" ;
        }
        let previousSession = sessions.data[sessions.count() - 1];
        let previousSessionIdString = previousSession.sessionId;
        let previousSessionId = Number(previousSessionIdString.split('-')[1]);
        let newSessionIdNumber = previousSessionId + 1;
        let newSessionId = 'session-' + newSessionIdNumber;
        return newSessionId;
    }

    function getNumberOfUsersCompletedPreQuestionair(session){
        return session.users.filter(user => user.preQuest.happinessScale ).length;
    }

function getNumberOfUsersCompletedPostQuestionair(session){
    return session.users.filter(user => user.postQuest.happinessScale ).length;
}
router.route('/user/post-quest')

/**
 * @method POST
 * Stores a post-questionnaire for the given user
 */
    .post(function (req, res) {
        let body = req.body;
        let postQuestSchema = convertPostQuestionnaireBodyToSchema(body);

        let clientId = req.header('client-id');
        let session = getLatestSession('asc');

        let sessionType = clientId.includes("exit") ? 'kima' : 'symbiosis' ;
        let maxNumberOfParticipants = sessionType === 'kima'  ? 3 : 8 ;
        let userNumber = clientId.match(/\d+/)[0] ;
        let userIndex = userNumber -1 ;

        processNewPostQuestSession(session, clientId, postQuestSchema, res,maxNumberOfParticipants,userIndex);

    });


let processNewPreQuestSession = function (session, clientId, preQuestSchema, res,maxNumberOfParticipants,userIndex) {

    let user = new User();

    if (!session.users || session.users.length === 0) {
        for (let i = 1 ; i <= maxNumberOfParticipants ; i++){
            session.users.push(user) ;
        }
    }

    user.preQuest = preQuestSchema ;

    session.users[userIndex] = user ;

    session.timestamp = new Date();
    session.active = 1;
    session.preCompleted = 0;
    session.save(function (err) {
        console.log('saving');
        if (err) return res.json({status: 'ERR', code: 500, msg: err});
        sessions.insert(session); // in memory database
        console.log('Successfully created new session');
        return res.json({status: 'OK', code: 200, msg: 'Saved data'});
    });
};



let processNewPostQuestSession = function (session, clientId, postQuestSchema, res,maxNumberOfParticipants,userIndex) {

    session.users[userIndex].postQuest = postQuestSchema;
    console.log("completed post questionair" + getNumberOfUsersCompletedPostQuestionair(session));
    session.postCompleted = getNumberOfUsersCompletedPostQuestionair(session) == maxNumberOfParticipants ? 1 : 0;
    updateSession(session, res);

};

let getLatestSession = function (sorting) {
    if (!sessions.data) return null;
    return sorting === 'asc' ? sessions.data[0] : sessions.data[sessions.count() - 1];

};

let updateSession = function (mySession, res) {

    if(mySession.preCompleted === 1 && mySession.postCompleted === 1){
        mySession.active = 0;
    }

    ExperimentSession.findOneAndUpdate({'_id': mySession._id}, mySession, {new: true, upsert: true}, function (err, doc) {
        if (err) return res.json({status: 'ERR', code: 500, msg: err});
        updateLatestSession(mySession);
        console.log(doc);
        if (mySession.active === 0) {
            removeInactiveSession(mySession);
            stopRecordingForSession(mySession);
        }
        return res.json({status: 'OK', code: 200, msg: 'Saved data'});
    });
};

let updateLatestSession = function (session) {
    sessions.update(session);
};

let removeInactiveSession = function (mySession) {
    sessions.remove(mySession);

};

let stopRecordingForSession = function (session) {
    let canRecord = config.findOne({type: 'canRecord'});
    let currentMicSession = config.findOne({type: 'currentMicSession'});

    if (currentMicSession.value == session.sessionId && canRecord.value == true) {
        currentMicSession.value = null;
        config.update(currentMicSession);
        canRecord.value = false;
        config.update(canRecord);
    }

};


/**
 * Converts  the request body into PreQuestionnaire
 * @param preQuest -  request body
 * @returns {*}
 */
let convertPreQuestionnaireBodyToSchema = function (preQuest) {
    let schema = new PreQuestionnaire();
    schema.age = preQuest.age;
    schema.gender = preQuest.gender;
    schema.connectionWithOthersScale = preQuest.connectionWithOthersScale;
    schema.tuningWithPeopleScale = preQuest.tuningWithPeopleScale;
    schema.happinessScale = preQuest.happinessScale;
    schema.lonelinessScale = preQuest.lonelinessScale;
    return schema;
};

/**
 * Converts  the request body into PostQuestionnaire
 * @param postQuest
 * @returns {*}
 */
let convertPostQuestionnaireBodyToSchema = function (postQuest) {
    let schema = new PostQuestionnaire();
    schema.singingPartnerFamiliarity = postQuest.singingPartnerFamiliarity;
    schema.symbiosisRoomFamiliarity = postQuest.symbiosisRoomFamiliarity;
    schema.connectionWithOthersScale = postQuest.connectionWithOthersScale;
    schema.tuningWithPeopleScale = postQuest.tuningWithPeopleScale;
    schema.happinessScale = postQuest.happinessScale;
    schema.lonelinessScale = postQuest.lonelinessScale;
    return schema;
};

module.exports = router;
