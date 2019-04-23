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
        var pairId = req.header('pairId');
        // data.rm(pairId);

        var originPair = new ExperimentPair();
        var pair = data.get(pairId);
        var user1 = null;
        var user2 = null;

        //check if the context has pair
        if (!pair) {
            console.log("FIRST");
            originPair.user1.preQuest = preQuestSchema;
            pair = originPair;
            pairId = uuidv4();
            pair.save(function (err) {
                if (err) return res.json({status: 'ERR', code: 500, msg: err});
                data.set(pairId, pair);
                return res.json({status: 'OK', code: 200, msg: 'Saved data', pairId: pairId});
            });

        } else if (pair.user1 && !pair.user2) {
            console.log("SECOND");

            console.log("Inside");
            user2 = originPair.user2;
            user2.preQuest = preQuestSchema;
            pair.user2 = user2;

            console.log(pair.user2);

            ExperimentPair.findOneAndUpdate({'_id': pair._id}, {$set: {user2: pair.user2}}, function (err, doc) {
                console.log("Updating...")
                if (err) return res.json({status: 'ERR', code: 500, msg: err});
                data.update(pairId, function (data) {
                    return data;
                });
                return res.json({status: 'OK', code: 200, msg: 'Saved data', pairId: pairId});
            });


        } else {
            console.log("Skipped");
            return res.json({msg: "Skipped"})
        }
    });

router.route('/user/post-quest')

/**
 * @method POST
 * Stores a post-questionnaire for the given user
 */
    .post(function (req, res) {
        var body = req.body;
        console.log(body);
        return res.json({status: 'OK', code: 200});
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

var convertPostQuestBodyToSchema = function (postQuest) {
    var schema = new PreQuestionnaire();
    schema.singingPartnerFamiliarity = post.singingPartnerFamiliarity;
    return schema;
};

module.exports = router;
