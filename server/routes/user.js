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

        //check if the context has un complete session
        if (!session) { // very first ession
            console.log("No session exist, creating new one");
            session = new ExperimentSession();
            session.sessionId = "session-1";
            processNewPreQuestSession(session, clientId, preQuestSchema, res);
        }
        else if (session && session.preCompleted === 0) {

            console.log('Found an existing session. only one user updated, updating the second....');
            updateExistingPreQuestSession(session, clientId, preQuestSchema, res)
        } else if (session && session.preCompleted === 1) {
            console.log("Session is full, creating new one...");
            let newSession = new ExperimentSession();
            let previousSession = sessions.data[sessions.count() - 1];
            let previousSessionIdString = previousSession.sessionId;
            let previousSessionId = Number(previousSessionIdString.split('-')[1]);
            let newSessionIdNumber = previousSessionId + 1;
            let newSessionId = 'session-' + newSessionIdNumber;
            newSession.sessionId = newSessionId;
            processNewPreQuestSession(newSession, clientId, preQuestSchema, res);
        }
    });

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

        if (clientId === 'tablet-exit-1') {
            console.log('Updating post questionnaire for user1');
            processNewPostQuestSession(session, clientId, postQuestSchema, res);
        } else if (clientId === 'tablet-exit-2') {
            console.log('Updating post questionnaire for user2');
            processNewPostQuestSession(session, clientId, postQuestSchema, res);
        } else {
            console.log('Wrong tablet....Skipping');
            return res.json({code: 200, msg: 'Tablet requested ' + clientId + '. tablets expected [tablet-exit-1, tablet-exit-2'})
        }

    });


let processNewPreQuestSession = function (session, clientId, preQuestSchema, res) {

    let user = new User();
    if (!session.users || session.users.length === 0) {
        session.users = [user , user];
    }

    user.preQuest = preQuestSchema ;
    if (clientId === 'tablet-entrance-1') {
        console.log(clientId);
        console.log('saving the pre questionaire data');
        session.users[0] = user ;


    } else if (clientId === 'tablet-entrance-2') {
        console.log(clientId);
        console.log('saving the pre questionaire data');
        session.users[1] = user ;
    }
    else {
        console.log('Not creating pre-questionnaire, new session but tablet is neither 1 nor 2, skipping...')
    }

    session.timestamp = new Date();
    session.active = 1;
    session.preCompleted = 0;
    session.save(function (err) {
        console.log('saving');
        if (err) return res.json({status: 'ERR', code: 500, msg: err});

        sessions.insert(session);
        console.log('Successfully created new session');
        return res.json({status: 'OK', code: 200, msg: 'Saved data'});
    });
};

let isEmpty = function (obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};


let updateExistingPreQuestSession = function (session, clientId, preQuestSchema, res) {

    let user = new User();
    user.preQuest = preQuestSchema;
    if (clientId === 'tablet-entrance-1') {
        console.log('Updating pre questionnaire for user1 in session with ID: ' + session._id + ", prequestionaire completed");
        if(!isEmpty(session.users[1].preQuest)){
            session.preCompleted = 1;
        }
        session.users[0].preQuest = preQuestSchema;
        updateSession(session, res);
    } else if (clientId === 'tablet-entrance-2') {
        console.log('Updating pre questionnaire for user1 in session with ID: ' + session._id + ", prequestionaire completed");
        if(!isEmpty(session.users[0].preQuest)) {
            session.preCompleted = 1;

        }
        session.users[1].preQuest = preQuestSchema;
        updateSession(session, res);

    } else {
        return res.json({
            status: 'OK',
            code: 200,
            msg: 'Session already exists and both users have filled their pre-questionnaire'
        })
    }
};


let processNewPostQuestSession = function (session, clientId, postQuestSchema, res) {

    if (clientId === 'tablet-exit-1') {
        if (session.users[1].postQuest.happinessScale) {
            console.log("post questionnaire completed");
            session.postCompleted = 1;
        }
        session.users[0].postQuest = postQuestSchema;
        updateSession(session, res);
    } else if (clientId === 'tablet-exit-2') {

        if (session.users[0].postQuest.happinessScale) {
            console.log("post questionnaire completed");
            session.postCompleted = 1;
        }
        session.users[1].postQuest = postQuestSchema;
        updateSession(session, res);
    }
    else {
        console.log('Sessions already populated');
        return res.json({code: 200, status: 'OK', msg: 'Sessions already populated'})
    }
};

let getLatestSession = function (sorting) {
    if (!sessions.data) return null;
    return sorting === 'asc' ? sessions.data[0] : sessions.data[sessions.count() - 1];

};

let updateSession = function (mySession, res) {

    if(mySession.preCompleted === 1 && mySession.postCompleted === 1){
        mySession.active = 0;
    }
    console.log("+++++++++++++");

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
