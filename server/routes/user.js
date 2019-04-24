/**
 * Created by bisho on 29/01/2017.
 */
const express = require('express');
const router = express.Router();

const uuidv4 = require('uuid/v4');
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
        var pairId = 'pair';
        // data.rm(pairId);

        var originPair = new ExperimentPair();
        var pair = data.get(pairId);

        //check if the context has pair
        if (!pair) {
            console.log("FIRST");
            pair = originPair;
            if (clientId === 'tablet-1') {
                originPair.user1.preQuest = preQuestSchema;
                pair.user1 = originPair.user1;
            } else if (clientId === 'tablet-2') {
                originPair.user2.preQuest = preQuestSchema;
                pair.user2 = originPair.user2;
            }

            // pairId = uuidv4();
            pair.save(function (err) {
                if (err) return res.json({status: 'ERR', code: 500, msg: err});
                data.set(pairId, pair);
                return res.json({status: 'OK', code: 200, msg: 'Saved data', pairId: pairId});
            });

        }
        else {
            if (clientId === 'tablet-1' && !pair.user1) {
                originPair.user1.preQuest = preQuestSchema;
                pair.user1 = originPair.user1;
            } else if (clientId === 'tablet-2' && !pair.user2) {
                originPair.user2.preQuest = preQuestSchema;
                pair.user2 = originPair.user2;
            } else {
                console.log("Skipped");
                return res.json({msg: "Skipped"})
            }

            ExperimentPair.findOneAndUpdate({'_id': pair._id}, pair, function (err, doc) {
                console.log("Updating...");
                if (err) return res.json({status: 'ERR', code: 500, msg: err});
                data.update(pairId, function (data) {
                    return data;
                });
                return res.json({status: 'OK', code: 200, msg: 'Saved data', pairId: pairId});
            });


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
        var originPair = new ExperimentPair();

        var clientId = req.header('client-id');
        var pairId = 'pair';
        var pair = data.get(pairId);
        // data.rm(pairId);

        if (clientId === 'tablet-3' && pair.user1) {
            originPair.user1.postQuest = postQuestSchema;
            pair.user1.postQuest = originPair.user1.postQuest = postQuestSchema;
        } else if (clientId === 'tablet-4' && pair.user2) {
            originPair.user2.postQuest = postQuestSchema;
            pair.user2.postQuest = originPair.user2.postQuest = postQuestSchema;
        } else {
            console.log("Skipped");
            return res.json({msg: "Skipped"})
        }

        ExperimentPair.findOneAndUpdate({'_id': pair._id}, pair, function (err, doc) {
            console.log("Updating Post...");
            if (err) return res.json({status: 'ERR', code: 500, msg: err});
            return res.json({status: 'OK', code: 200, msg: 'Saved data', pairId: pairId});
        });

        if((pair.user1.preQuest && pair.user1.postQuest) && (pair.user2.preQuest && pair.user2.postQuest )){
            //remove the pair from in memory db
            data.rm(pairId);
        }
    });

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
