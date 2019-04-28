/**
 * Created by bisho.
 */
const express = require('express');
const router = express.Router();

// in memory db for storing pairs temporarily
const dirty = require('dirty');
var data = dirty('pair');

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
        var pairId = req.header('pair-id');
        var pair = data.get(pairId);

        //check if the context has pair
        if (!pair) {
            console.log("No pair exist, creating new one");
            pair = new ExperimentPair();
            if (clientId === 'tablet-1') {
                pair.user1.preQuest = preQuestSchema;
            } else if (clientId === 'tablet-2') {
                pair.user2.preQuest = preQuestSchema
            }
            else {
                console.log('Not creating pre-questionnaire, new pair but tablet is neither 1 nor 2, skipping...')
            }

            pairId = pair._id;
            pair.timestamp = new Date();
            pair.save(function (err) {
                if (err) return res.json({status: 'ERR', code: 500, msg: err});
                data.set(pairId, pair);
                console.log('Successfully created new pair with id: ' + pairId);
                return res.json({status: 'OK', code: 200, msg: 'Saved data', pairId: pairId});
            });
        }
        else {
            console.log('Found an existing pair. only one user updated, updating the second....')
            if (clientId === 'tablet-1') {
                console.log('Updating pre questionnaire for user1 in pair with ID: ' + pair._id);
                pair.user1.preQuest = preQuestSchema;
                updatePair(pair, res);
            } else if (clientId === 'tablet-2') {
                console.log('Updating pre questionnaire for user1 in pair with ID: ' + pair._id);
                pair.user2.preQuest = preQuestSchema;
                updatePair(pair, res);

            } else {
                return res.json({status: 'OK', code: 200, msg: 'Pair already exists and both users have filled their pre-questionnaire'})
            }
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
        var pairId = req.header('pair-id');
        var pair = data.get(pairId);

        if (clientId === 'tablet-3') {
            console.log('Updating post questionnaire for user1 in pair with ID: ' + pair._id);
            pair.user1.postQuest = postQuestSchema;
            updatePair(pair, res);
        } else if (clientId === 'tablet-4') {
            console.log('Updating post questionnaire for user1 in pair with ID: ' + pair._id);
            pair.user2.postQuest = postQuestSchema;
            updatePair(pair, res);
        } else {
            console.log('Wrong tablet....Skipping');
            return res.json({code: 200, msg: 'Tablet requested ' + clientId + '. tablets expected [tablet-3, tablet-4'})
        }

    });



/**
 * Updates the pair with the given pair._id
 * @param pair - the pair to update
 * @param res - the  response object
 */
var updatePair = function (pair, res) {
    ExperimentPair.findOneAndUpdate({'_id': pair._id}, pair, {new: true}, function (err, doc) {
        if (err) return res.json({status: 'ERR', code: 500, msg: err});
        data.update(pair._id, function (data) {
            return data;
        });

        return res.json({status: 'OK', code: 200, msg: 'Saved data', pairId: pair._id});
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
