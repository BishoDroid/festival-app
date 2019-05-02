const express = require('express');
const router = express.Router();

require('../db/festival-app-db');
// in memory db for storing pairs temporarily
const lokiSingleton = require('../db/festival-app-db-in-loki');

var db = lokiSingleton.getInstance();

var pairs = db.getCollection('pairs');
var config = db.getCollection('config');

var PreQuestionnaire = require('../models/PreQuestionnaire');
var PostQuestionnaire = require('../models/PostQuestionnaire');
var ExperimentPair = require('../models/ExperimentPair');

router.route('/user/remove') // to remove the pair by admin

    .post(function (req, res) {
        let pairId = req.header('pair-id');

        let pair = pairs.findOne({sessionId: pairId});
        pair.active = 0;

        ExperimentPair.findOneAndUpdate({'_id': pair._id}, pair, {new: true}, function (err, doc) {
            if (err) return res.json({status: 'ERR', code: 500, msg: err});

            removeInactivePair(pair);
            stopRecordingForPair(pair);
            console.log("session: " + sessionId + " is removed");
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
        let pair = getLatestPair('desc');

        //check if the context has un complete pair
        if (!pair) { // very first pair
            console.log("No pair exist, creating new one");
            pair = new ExperimentPair();
            pair.sessionId = "session-1";
            processNewPreQuestPair(pair, clientId, preQuestSchema, res);
        }
        else if (pair && pair.preCompleted === 0) {
            console.log('Found an existing pair. only one user updated, updating the second....');
            updateExistingPreQuestPair(pair, clientId, preQuestSchema, res)
        } else if (pair && pair.preCompleted === 1) {
            console.log("Pair is full, creating new one...");
            let newPair = new ExperimentPair();
            let previousSession = pairs.data[pairs.count() - 1];
            let previousSessionIdString = previousSession.sessionId;
            let previousSessionId = Number(previousSessionIdString.split('-')[1]);
            let newSessionIdNumber = previousSessionId + 1;
            let newSessionId = 'session-' + newSessionIdNumber;
            newPair.sessionId = newSessionId;
            processNewPreQuestPair(newPair, clientId, preQuestSchema, res);
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
        let pair = getLatestPair('asc');

        if (clientId === 'tablet-3') {
            console.log('Updating post questionnaire for user1');
            processNewPostQuestPair(pair, clientId, postQuestSchema, res);
        } else if (clientId === 'tablet-4') {
            console.log('Updating post questionnaire for user2');
            processNewPostQuestPair(pair, clientId, postQuestSchema, res);
        } else {
            console.log('Wrong tablet....Skipping');
            return res.json({code: 200, msg: 'Tablet requested ' + clientId + '. tablets expected [tablet-3, tablet-4'})
        }

    });


var processNewPreQuestPair = function (pair, clientId, preQuestSchema, res) {
    if (clientId === 'tablet-1') {
        console.log(clientId);
        console.log('saving the pre questionaire data');
        pair.user1.preQuest = preQuestSchema;
    } else if (clientId === 'tablet-2') {
        console.log(clientId);
        console.log('saving the pre questionaire data');
        pair.user2.preQuest = preQuestSchema
    }
    else {
        console.log('Not creating pre-questionnaire, new pair but tablet is neither 1 nor 2, skipping...')
    }

    pair.timestamp = new Date();
    pair.active = 1;
    pair.preCompleted = 0;
    pair.save(function (err) {
        console.log('saving');
        if (err) return res.json({status: 'ERR', code: 500, msg: err});

        pairs.insert(pair);
        console.log('Successfully created new pair');
        return res.json({status: 'OK', code: 200, msg: 'Saved data'});
    });
};

var isEmpty = function (obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}


var updateExistingPreQuestPair = function (pair, clientId, preQuestSchema, res) {
    if (clientId === 'tablet-1') {
        console.log('Updating pre questionnaire for user1 in pair with ID: ' + pair._id + ", prequestionaire completed");
        if(!isEmpty(pair.user2.preQuest)){
            pair.preCompleted = 1;

        }
        pair.user1.preQuest = preQuestSchema;
        updatePair(pair, res);
    } else if (clientId === 'tablet-2') {
        console.log('Updating pre questionnaire for user1 in pair with ID: ' + pair._id + ", prequestionaire completed");
        if(!isEmpty(pair.user1.preQuest)) {
            pair.preCompleted = 1;

        }
        pair.user2.preQuest = preQuestSchema;
        updatePair(pair, res);

    } else {
        return res.json({
            status: 'OK',
            code: 200,
            msg: 'Pair already exists and both users have filled their pre-questionnaire'
        })
    }
};


var processNewPostQuestPair = function (pair, clientId, postQuestSchema, res) {

    if (clientId === 'tablet-3') {

        if (pair.user2.postQuest.happinessScale) {
            console.log(pair.user2.postQuest);
            console.log("post questionnaire completed");
            pair.postCompleted = 1;
        }
        pair.user1.postQuest = postQuestSchema;
        updatePair(pair, res);
    } else if (clientId === 'tablet-4') {

        if (pair.user1.postQuest.happinessScale) {
            console.log(pair.user1.postQuest.happinessScale);
            console.log("post questionnaire completed");
            pair.postCompleted = 1;
        }
        pair.user2.postQuest = postQuestSchema;
        updatePair(pair, res);
    }
    else {
        console.log('Pairs already populated');
        return res.json({code: 200, status: 'OK', msg: 'Pairs already populated'})
    }
};

var getLatestPair = function (sorting) {
    if (!pairs.data) return null;
    return sorting === 'asc' ? pairs.data[0] : pairs.data[pairs.count() - 1];

};

var updatePair = function (myPair, res) {
    if(myPair.preCompleted === 1 && myPair.postCompleted === 1){
        myPair.active = 0;
    }

    ExperimentPair.findOneAndUpdate({'_id': myPair._id}, myPair, {new: true}, function (err, doc) {
        if (err) return res.json({status: 'ERR', code: 500, msg: err});
        updateLatestPair(myPair);

        if (myPair.active === 0) {

            removeInactivePair(myPair);
            stopRecordingForPair(myPair);
        }
        return res.json({status: 'OK', code: 200, msg: 'Saved data'});
    });
};

var updateLatestPair = function (pair) {
    pairs.update(pair);
};

var removeInactivePair = function (myPair) {
    pairs.remove(myPair);

};

var stopRecordingForPair = function (pair) {
    let canRecord = config.findOne({type: 'canRecord'});
    let currentMicPair = config.findOne({type: 'currentMicPair'});

    if (currentMicPair.value == pair.sessionId && canRecord.value == true) {
        currentMicPair.value = null;
        config.update(currentMicPair);
        canRecord.value = false;
        config.update(canRecord);
    }

};


/**
 * Converts  the request body into PreQuestionnaire
 * @param preQuest -  request body
 * @returns {*}
 */
var convertPreQuestionnaireBodyToSchema = function (preQuest) {
    var schema = new PreQuestionnaire();
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
var convertPostQuestionnaireBodyToSchema = function (postQuest) {
    var schema = new PostQuestionnaire();
    schema.singingPartnerFamiliarity = postQuest.singingPartnerFamiliarity;
    schema.symbiosisRoomFamiliarity = postQuest.symbiosisRoomFamiliarity;
    schema.connectionWithOthersScale = postQuest.connectionWithOthersScale;
    schema.tuningWithPeopleScale = postQuest.tuningWithPeopleScale;
    schema.happinessScale = postQuest.happinessScale;
    schema.lonelinessScale = postQuest.lonelinessScale;
    return schema;
};

module.exports = router;
