/**
 * Created by bisho on 28/04/2019.
 */
const express = require('express');
const router = express.Router();

require('../db/festival-app-db');
const lokiSingleton = require('../db/festival-app-db-in-loki');
let db = lokiSingleton.getInstance();
let sessions = db.getCollection('sessions');

router.route('/sessions/all')
    .get(function (req, res) {
            if (sessions.data) {
                //console.log('Found ' + sessions.data.length + ' sessions');
                return res.json(sessions.data);
            }
        }
    );

module.exports = router;