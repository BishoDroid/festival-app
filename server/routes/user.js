const express = require('express');
const router = express.Router();

require('../db/festival-app-db');
// in memory db for storing sessions temporarily
const lokiSingleton = require('../db/festival-app-db-in-loki');
const numberOfKimaParticipants = 2;
const numberOfSymbiosisParticipants = 8 ;

let db = lokiSingleton.getInstance();
let sessions = db.getCollection('sessions');
let config = db.getCollection('config');

let PreQuestionnaire = require('../models/PreQuestionnaire');
let PostQuestionnaire = require('../models/PostQuestionnaire');
let ExperimentSession = require('../models/ExperimentSession');
let User = require('../models/User');
let log = require('../utils/logger');

router.route('/user/remove') // to remove the session by admin

    .post(function (req, res) {
        let sessionId = req.header('session-id');
        let session = sessions.findOne({sessionId: sessionId});
        if (session.recordingStopTime === undefined) {
            console.log("I am undefined");
            session.recordingStopTime = new Date();
        }

        session.active = 0;

        ExperimentSession.findOneAndUpdate({'_id': session._id}, session, {new: true}, function (err, doc) {
            if (err) return res.json({status: 'ERR', code: 500, msg: err});

            stopRecordingForSession(session);
            removeInactiveSession(session);

            console.log("session: " + session.sessionId + " is removed");
            return res.json({status: 'OK', code: 200, msg: 'Saved data'});
            log(session.sessionType,'OK', "session " + session.sessionId  + " has been removed");
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
        let sessionType = getSessionType(clientId) ;

        if (isFreeTablet(clientId)) {
            log(sessionType, 'ERROR', 'The tablet you are using is unregistered in the app, please register it in the admin page');
            return res.status(500).send("The tablet you are using is unregistered in the app, please register it in the admin page" );
        }
        if(!isRecognizedClientId(clientId)) {
            log(sessionType, 'ERROR', 'The tablet with id '+ clientId + 'is unknown');
            return res.status(500).send('The tablet with id '+ clientId + 'is unknown') ;
        }


        if (isKima(sessionType) && isKimaExitTablet(clientId)) {
            log(sessionType, 'ERROR', 'This is an exit tablet and it can only be used to send Post Engagement questionnaire data');
            return res.status(500).send('This is an exit tablet and it can only be used to send Post Engagement questionnaire data') ;
        }

        let session = getLatestSession('desc',sessionType);

        let userNumber = clientId.match(/\d+/)[0] ;
        let userIndex = userNumber -1 ;
        let sessionWithCompletePreQuestionair = session && session.preCompleted === 1 ;
        console.log(session);

        if (session && session.users[userIndex].preQuest.age !== undefined && !sessionWithCompletePreQuestionair) {
            log(sessionType, "ERROR",'This user has already submitted Pre Engagement questionnaire, you cannot resubmit');
            return res.status(500).send('This user has already submitted Pre Engagement questionnaire, you cannot resubmit') ;

        }


        let maxNumberOfParticipants = sessionType === 'kima'  ? numberOfKimaParticipants : numberOfSymbiosisParticipants ;


        //check if the context has un complete session
        if (!session || sessionWithCompletePreQuestionair ) {
            console.log("creating new session");
            let newSession = new ExperimentSession();
            newSession.sessionId = getNextSessionId(sessions);
            processNewPreQuestSession(newSession, clientId, preQuestSchema, res,maxNumberOfParticipants,userIndex,sessionType);
        }

        else if (session && session.preCompleted === 0) {
            console.log('Found an existing session. only one user updated, updating the second....');
            updateExistingPreQuestSession(session, clientId, preQuestSchema, res,maxNumberOfParticipants,userIndex)
        }
    });

let updateExistingPreQuestSession = function (session, clientId, preQuestSchema, res,maxNumberOfParticipants,userIndex) {

    session.users[userIndex].preQuest = preQuestSchema;
    log(session.sessionType,'OK', "session " + session.sessionId  +  ", user : " + (userIndex+1).toString(10) + " has submitted pre questionnaire" );

    session.preCompleted = getNumberOfUsersCompletedPreQuestionair(session) == maxNumberOfParticipants ? 1 : 0;

    if (session.preCompleted) {
        log(session.sessionType,'OK', "session " + session.sessionId  +  "all " + maxNumberOfParticipants + " user have submitted pre questionnaire" );

    }

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

function isRecognizedClientId (clientId) {
        return clientId.match(/tablet-\d+/g) || clientId.match(/tablet-entrance-\d+/g) || clientId.match(/tablet-exit-\d+/g)
}
function isFreeTablet(clientId){
        console.log(clientId) ;
        return (clientId === "free-tablet");
}

function isKimaEntranceTablet (clientId) {
  return  clientId.includes("entrance")  ;
}

function isKimaExitTablet (clientId) {

    return clientId.includes("exit") ;
}

function isSymbiosis (sessionType) {
        return sessionType === 'symbiosis' ;
}

function isKima (sessionType) {
    return sessionType === 'kima' ;
}

function getSessionType (clientId) {

        if (clientId.match(/tablet-entrance-\d+/g)   || clientId.match(/tablet-exit-\d+/g) ) {
            return "kima";
        }
        else if (clientId.match(/tablet-\d+/g)) {
            return "symbiosis"
        }
        else {
            return "unknown" ;
        }
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

        if  (isFreeTablet(clientId)) {
            return res.status(500).send("this tablet is unspecified, please set this tablet from the admin page" );
        }
        if (!isRecognizedClientId(clientId)) {
            return res.status(500).send("unknown tablet type" ) ;
        }

        let sessionType = getSessionType(clientId) ;
        if (isKima(sessionType) && isKimaEntranceTablet(clientId)) {
            return res.status(500).send("this tablet is an entrance tablet, you can only send pre- questionnaire" ) ;
        }

        let session = getLatestSession('asc',sessionType);

        if (session === undefined){
            return res.status(500).send("there is no current session for post questionnaire") ;
        }

        let userNumber = clientId.match(/\d+/)[0] ;
        let userIndex = userNumber -1 ;

        if (session && session.users[userIndex].postQuest.happinessScale !== undefined) {
            return res.status(500).send("this user already submitted the post-quest , you cannot resubmit" ) ;
        }

        if ((session && session.users[userIndex].preQuest.happinessScale === undefined) || !session) {
            return res.status(500).send("this user haven't submitted the pre-quest, you cannot submit a post quest" ) ;
        }

        let maxNumberOfParticipants = sessionType === 'kima'  ? numberOfKimaParticipants : numberOfSymbiosisParticipants ;

        processNewPostQuestSession(session, clientId, postQuestSchema, res,maxNumberOfParticipants,userIndex,sessionType);

    });


let processNewPreQuestSession = function (session, clientId, preQuestSchema, res,maxNumberOfParticipants,userIndex,sessionType) {

    let user = new User();

    if (!session.users || session.users.length === 0) {
        for (let i = 1 ; i <= maxNumberOfParticipants ; i++){
            session.users.push(user) ;
        }
    }

    user.preQuest = preQuestSchema ;
    console.log(sessionType) ;
    session.sessionType = sessionType;
    session.status = "ready";
    session.numberOfLoggedData = 0;
    session.users[userIndex] = user ;

    session.timestamp = new Date();
    session.active = 1;
    session.preCompleted = 0;
    session.save(function (err) {
        console.log('saving');
        if (err) return res.json({status: 'ERR', code: 500, msg: err});
        sessions.insert(session); // in memory database
        log(session.sessionType,'OK', "session " + session.sessionId  + " has been created");
        log(session.sessionType,'OK', "session " + session.sessionId  +  ", user : " + (userIndex+1).toString(10) + " has submitted pre questionnaire" );
        console.log('Successfully created new session');
        return res.json({status: 'OK', code: 200, msg: 'Saved data'});
    });
};



let processNewPostQuestSession = function (session, clientId, postQuestSchema, res,maxNumberOfParticipants,userIndex) {

    session.users[userIndex].postQuest = postQuestSchema;
    console.log("completed post questionnaire" + getNumberOfUsersCompletedPostQuestionair(session));
    log(session.sessionType,'OK', "session " + session.sessionId  +  ", user : " + (userIndex+1).toString(10) + " has submitted post questionnaire" );

    session.postCompleted = getNumberOfUsersCompletedPostQuestionair(session) == maxNumberOfParticipants ? 1 : 0;

    if (session.postCompleted){
        log(session.sessionType,'OK', "session " + session.sessionId  +  "all " + maxNumberOfParticipants + " user have submitted post questionnaire" );

    }


    updateSession(session, res);

};

let getLatestSession = function (sorting,sessionType) {
    if (!sessions.data) return null;
  //  return sorting === 'asc' ? sessions.data[0] : sessions.data[sessions.count() - 1];
    if (sorting === 'asc' ){

        for (let index = 0 ; index < sessions.data.length ; index++){
            if (sessions.data[index].sessionType === sessionType )
            {
                return sessions.data[index];
            }
        }
    } else {
        for (let index = sessions.count() - 1 ; index >= 0 ; index--){
            if (sessions.data[index].sessionType === sessionType )
            {
                return sessions.data[index];
            }
        }
    }

    return null; // just in case

};

let updateSession = function (mySession, res) {

   let allParticipantsSubmitted = getNumberOfUsersCompletedPostQuestionair(mySession) === getNumberOfUsersCompletedPreQuestionair(mySession);
   let preAndPostQuestCompleted =  mySession.preCompleted === 1 && mySession.postCompleted === 1;

    if(allParticipantsSubmitted || preAndPostQuestCompleted){
        mySession.active = 0;
        log(mySession.sessionType,'OK', "session " + mySession.sessionId  +  "is inactive " );

    }

    if (mySession.recordingStopTime == undefined) {
        console.log("I am undefined");
        mySession.recordingStopTime = new Date();
    }


    ExperimentSession.findOneAndUpdate({'_id': mySession._id}, mySession, {new: true, upsert: true}, function (err, doc) {
        if (err) return res.json({status: 'ERR', code: 500, msg: err});
        updateLatestSession(mySession);
        if (mySession.active === 0) {
            stopRecordingForSession(mySession);
            removeInactiveSession(mySession);
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
    session.status = "stopped";
    console.log(session);
    sessions.update(session);
    log(session.sessionType,'OK', "session " + session.sessionId  +  " stopped recording " );


};


/**
 * Converts  the request body into PreQuestionnaire
 * @param preQuest -  request body
 * @returns {*}
 */
let convertPreQuestionnaireBodyToSchema = function (preQuest) {
    let schema = new PreQuestionnaire();
    schema.submissionTime = new Date;
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
    schema.submissionTime = new Date;
    schema.singingPartnerFamiliarity = postQuest.singingPartnerFamiliarity;
    schema.symbiosisRoomFamiliarity = postQuest.symbiosisRoomFamiliarity;
    schema.connectionWithOthersScale = postQuest.connectionWithOthersScale;
    schema.tuningWithPeopleScale = postQuest.tuningWithPeopleScale;
    schema.happinessScale = postQuest.happinessScale;
    schema.lonelinessScale = postQuest.lonelinessScale;
    return schema;
};

module.exports = router;
