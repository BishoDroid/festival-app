/**
 * Created by bisho on 28/04/2019.
 */
const express = require('express');
const router = express.Router();

require('../db/festival-app-db');
var ExperimentPair = require('../models/ExperimentPair');

router.route('/pairs/all')
    .get(function (req, res) {
        ExperimentPair.find({}).sort({timestamp: 'desc'}).exec(function (err, pairs) {
            if(pairs){
                console.log('Found '+pairs.length + ' pairs');
                return res.json({status: 'OK',  code: 200, pairs: pairs});
            }
        })
    });

module.exports = router;