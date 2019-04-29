/**
 * Created by bisho.
 */
const express = require('express');
const router = express.Router();
const _ = require('underscore');
const lodash = require('lodash');
// in memory db for storing pairs temporarily
const dirty = require('dirty');
var pairsFile = dirty('pairsFile');


require('../db/festival-app-db');
var PreQuestionnaire = require('../models/PreQuestionnaire');
var SensorData = require('../models/SensorData');
var PostQuestionnaire = require('../models/PostQuestionnaire');
var ExperimentPair = require('../models/ExperimentPair');
var User = require('../models/User');

router.route('/user/pre-quest')

/**
 * @method POST
 * Stores a pre-questionnaire for the given user
 */
    .post(function (req, res) {

        var body = req.body;
        var preQuestSchema = convertPreQuestionnaireBodyToSchema(body);
        var clientId = req.header('client-id');
        console.log("CLIENT ID " + clientId);
        var pair = getLatestPair('desc');

        //check if the context has un complete pair
        if (!pair) {
            console.log("No pair exist, creating new one");
            pair = new ExperimentPair();
            processNewPreQuestPair(pair, clientId, preQuestSchema, res);
        }
        else if (pair && pair.preCompleted === 0) {
            console.log('Found an existing pair. only one user updated, updating the second....');
            updateExistingPreQuestPair(pair, clientId, preQuestSchema, res)
        } else if (pair && pair.preCompleted === 1) {
            console.log("Pair is full, creating new one...");
            var newPair = new ExperimentPair();
            processNewPreQuestPair(newPair, clientId, preQuestSchema, res);
        }
    });

router.route('/user/post-quest')

/**
 * @method POST
 * Stores a post-questionnaire for the given user
 */
    .post(function (req, res) {
        var body = req.body;
        var postQuestSchema = convertPostQuestionnaireBodyToSchema(body);

        var clientId = req.header('client-id');
        var pair = getLatestPair('asc');
        console.log("THE PAIR");
        console.log(pair);
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
        let existingPairs = pairsFile.get('activePairs');
        pairsFile.update('activePairs',function() {
            existingPairs.push(pair);
            return existingPairs;
        });

        console.log('Successfully created new pair');
        return res.json({status: 'OK', code: 200, msg: 'Saved data'});
    });
};

var isEmpty = function (obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}


var updateExistingPreQuestPair = function (pair, clientId, preQuestSchema, res) {
    if (clientId === 'tablet-1') {
        console.log('Updating pre questionnaire for user1 in pair with ID: ' + pair._id);
        if(!isEmpty(pair.user2.preQuest)){
            pair.preCompleted = 1;
            console.log("set completed");
        }
        pair.user1.preQuest = preQuestSchema;
        updatePair(pair, res, 'desc');
    } else if (clientId === 'tablet-2') {
        console.log('Updating pre questionnaire for user1 in pair with ID: ' + pair._id);
        if(!isEmpty(pair.user1.preQuest)) {
            pair.preCompleted = 1;
            console.log("set completed");
        }
        pair.user2.preQuest = preQuestSchema;
        updatePair(pair, res, 'desc');

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

        if(pair.user2.postQuest.happinessScale !== undefined) {
            console.log("Iam being set because am tablet 3 and tablet 4 already submitted");
            pair.postCompleted = 1;
        }
        pair.user1.postQuest = postQuestSchema;
        updatePair(pair, res, 'asc');
    } else if (clientId === 'tablet-4') {

        if(!pair.user1.postQuest.happinessScale !== undefined){
            console.log("Iam being set because am tablet 4 and tablet 3 already submitted");
            pair.postCompleted = 1;
        }
        pair.user2.postQuest = postQuestSchema;
        updatePair(pair, res, 'asc');
    }
    else {
        console.log('Pairs already populated');
        return res.json({code: 200, status: 'OK', msg: 'Pairs already populated'})
    }
};

var getLatestPair = function (sorting) {
    let activePairs = pairsFile.get('activePairs');

    if (!activePairs) return null;
    _.sortBy(activePairs, function (pair) {
        return pair.timestamp
    });
    if(sorting === 'desc')  {
        activePairs.reverse();
    }

    console.log("the latest pair BEING RETURNED");
    return activePairs[0];
};

var updatePair = function (myPair, res, order) {
    if(myPair.preCompleted === 1 && myPair.postCompleted === 1){
        myPair.active = 0;
    }

    ExperimentPair.findOneAndUpdate({'_id': myPair._id}, myPair, {new: true}, function (err, doc) {
        if (err) return res.json({status: 'ERR', code: 500, msg: err});
        updateLatestPair(myPair, order);

        if(myPair.active === 0) removeInactivePair(myPair);
        return res.json({status: 'OK', code: 200, msg: 'Saved data'});
    });
};

var updateLatestPair = function (pair, order) {

    let activePairs = pairsFile.get('activePairs');

    pairsFile.update('activePairs', function () {
      return  activePairs;
    });
};

var removeInactivePair = function (myPair) {
    let activePairs = pairsFile.get('activePairs');
    activePairs = activePairs.filter(item => item !== myPair);


    pairsFile.update('activePairs', function () {
        return activePairs;
    });
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
