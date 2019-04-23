/**
 * Created by bisho on 29/01/2017.
 */
var httpContext = require('request-context');
var express = require('express');
var router = express.Router();

require('../db/festival-app-db');
var PreQuestionnaire = require('../models/PreQuestionnaire');
var PostQuestionnaire = require('../models/PostQuestionnaire');
var ExperimentPair = require('../models/ExperimentPair');
var User = require('../models/User');

router.route('/user/pre-quest')

/**
 * @method POST
 * Stores a pre-questionnaire for the given user
 */
    .post(function (req, res, next) {
        var body = req.body;
        var preQuestSchema = convertPreQuestionnaireBodyToSchema(body);
        var clientId = req.header('client-id');
        var pair = null;
        var user1 = null;
        var user2 = null;

        console.log(body);
        console.log(pair = httpContext.get('pair'));
        //check if the context has pair
        if (typeof httpContext.get('pair') === 'undefined') {
            pair = new ExperimentPair();
            user1 = new User();
            user1.preQuest = preQuestSchema;
            pair.user1 = user1;
            pair.save(function (err) {
                if (err) return res.json({status: 'ERR', code: 500, msg: err});
                // httpContext.set('request:pair', pair);
                return res.json({status: 'OK', code: 200, msg: 'Saved data successfully'});
            });
        } else {
            pair = httpContex.get('pair');
            if (pair.user2 === null) {
                user2 = new User();
                user2.preQuest = preQuestSchema;
                pair.user2 = user2;
                ExperimentPair.findOneAndUpdate({'_id': pair._id}, pair, {upsert: true}, function (err, doc) {
                    if (err) return res.json({status: 'ERR', code: 500, msg: err});
                    // httpContext.set('request:pair', null);
                    return res.json({status: 'OK', code: 200, msg: 'Saved data successfully'});
                });
            }
        }
        //create a pair with user one if empty
        //add user 2 data if pair exists
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
