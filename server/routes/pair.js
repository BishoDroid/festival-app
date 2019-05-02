/**
 * Created by bisho on 28/04/2019.
 */
const express = require('express');
const router = express.Router();

require('../db/festival-app-db');
const lokiSingleton = require('../db/festival-app-db-in-loki');
var db = lokiSingleton.getInstance();
var pairs = db.getCollection('pairs');

router.route('/pairs/all')
    .get(function (req, res) {
            if(pairs.data) {
                console.log('Found ' + pairs.data.length + ' pairs');
                return res.json(pairs.data);
            }}
            );

module.exports = router;