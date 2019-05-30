/**
 * Created by bisho on 26/05/2019.
 */
const express = require('express');
const router = express.Router();

require('../db/festival-app-db');

let Log = require('../models/Log');
let query = {};

router.route('/logs')
    .get(function (req, res) {
        let order = req.query.order === 'undefined' ? 'desc' : req.query.order;
        let limit = req.query.limit === 'undefined' ? 50 : parseInt(req.query.limit);
        let status = req.query.status;
        let type = req.query.type;

        validate(status, type);
        Log.find(query)
            .sort({time: order})
            .limit(limit)
            .exec(function (err, data) {
                if (err) {
                    console.log('Error, Could not retrieve logs\nReason: ' + err);
                    res.status(500).send('Error, Could not retrieve logs\nReason: ' + err);
                } else {
                    res.json({code: 200, status: 'OK', data: data});
                }
            })
    });

let validate = function (status, type) {
    if (status === 'ERROR' || status === 'OK') {
        query['status'] = status;
    }else{
        delete query['status'];
    }
    if (type === 'symbiosis' || type === 'kima') {
        query['type'] = type;
    }else{
        delete query['type'];
    }
};

module.exports = router;