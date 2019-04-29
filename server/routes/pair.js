/**
 * Created by bisho on 28/04/2019.
 */
const express = require('express');
const router = express.Router();

require('../db/festival-app-db');
var ExperimentPair = require('../models/ExperimentPair');

router.route('/pairs/all')
    .get(function (req, res) {
        ExperimentPair.find({}).sort({timestamp: 'asc'}).exec(function (err, pairs) {
            if(pairs){
                console.log('Found '+pairs.length + ' pairs');
                return res.json( pairs);
            }
        })
    });

module.exports = router;