/**
 * Created by bisho on 28/04/2019.
 */
const express = require('express');
const router = express.Router();
let ExperimentSession = require('../models/ExperimentSession');
require('../db/festival-app-db');
const lokiSingleton = require('../db/festival-app-db-in-loki');
let db = lokiSingleton.getInstance();
let sessions = db.getCollection('sessions');

router.route('/sessions/active')
    .get(function (req, res) {
            if (sessions.data) {
                console.log('Found ' + sessions.data.length + ' sessions');
                return res.json(sessions.data);
            }
        }
    );


router.route('/sessions/all')
    .get(function (req, res){

        ExperimentSession.find({}).sort({timestamp: 'desc'}).exec(function (err, sessions) {
            if(sessions){
                console.log('Found '+sessions.length + ' sessions');
                return res.json({status: 'OK',  code: 200, sessions: sessions});
            }
        })
    });


module.exports = router;