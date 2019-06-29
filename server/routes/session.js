/**
 * Created by bisho on 28/04/2019.
 */
var Q = require('q');
var Promise = require('bluebird');
var async = require('async');
const express = require('express');
const router = express.Router();
let ExperimentSession = require('../models/ExperimentSession');
let SensorData = require('../models/SymbiosisSensorData')
require('../db/festival-app-db');
const lokiSingleton = require('../db/festival-app-db-in-loki');
let db = lokiSingleton.getInstance();
let sessions = db.getCollection('sessions');

router.route('/sessions/active')
    .get(function (req, res) {

        let _sessionType = req.query.type;
        console.log("type :   " + req.query.type)
        if (sessions.data) {
            if (_sessionType == 'all') {
                return res.json(sessions.data);

            } else if (_sessionType == 'kima' || _sessionType == 'symbiosis') {
                return res.json(sessions.data.filter(session => session.sessionType === _sessionType));
            } else {
                return res.json(sessions.data);
            }// console.log('Found ' + sessions.data.length + ' sessions');

        }
    });


router.route('/sessions/all')
    .get(function (req, res) {

        ExperimentSession.find({}).sort({timestamp: 'desc'}).lean().exec(function (err, sessions) {
            if (!sessions) {
                return res.json({status: 'OK', code: 200, sessions: []});
            }
            dataPromises = [];
            // loop through sessions

            for (const session of sessions) {

                let sessionIdString = (session._id).toString();

                let kimaSessionRealtimeDataArgs = {sessionId: sessionIdString, isUser: 0, sessionType: 'kima'};
                let symbiosisSessionSumaryData = {
                    sessionId: sessionIdString,
                    isUser: 0,
                    sessionType: 'symbiosis',
                    isSummary: 1
                };

                // real time session data for kima
                dataPromises.push((callback) => {
                    SensorData.find(kimaSessionRealtimeDataArgs)
                        .sort({timestamp: 'desc'})
                        .lean()
                        .exec((err, sessionData) => {
                            if (err) {
                                return callback(err);
                            }
                            session.sessionRealtimeData = sessionData;
                            callback(null, session);
                        });
                });

                // summary data for symbiosis
                dataPromises.push((callback) => {
                    SensorData.find(symbiosisSessionSumaryData)
                        .sort({timestamp: 'desc'})
                        .lean()
                        .exec((err, summaryData) => {
                            if (err) {
                                return callback(err);
                            }
                            session.sessionSumaryData = summaryData;
                            callback(null, session);
                        });
                });


                // get kima users realTimeData
                let kimaUserRealtimeDataArgs = {sessionId: sessionIdString, isUser: 1, sessionType: 'kima'};
                let _userNumber = 1;
                let userIdString;
                for (const user of session.users) {

                    if (session.sessionType != 'kima') {
                        continue;
                    }

                    userIdString = (user._id).toString();
                    kimaUserRealtimeDataArgs = { sessionId : sessionIdString , userNumber : _userNumber, isUser: 1, sessionType: 'kima'};
                    console.log("userIdString" + userIdString);
                    dataPromises.push((callback) => {
                        SensorData.find(kimaUserRealtimeDataArgs)
                            .sort({timestamp: 'desc'})
                            .lean()
                            .exec((err, userData) => {
                                if (err) {
                                    return callback(err);
                                }
                                user.userRealTimeData = userData;
                                callback(null, session);
                            });
                    });

                    ++_userNumber;
                    console.log("user Number :" + _userNumber);

                }

            } // for sessions

            //
            async.parallel(dataPromises, function (err, result) {

                if (err) {
                    return console.log(err);
                }
                return res.json({status: 'OK', code: 200, sessions: sessions});

            });

        })
    })
;


async function getSessionData(_sessionId, session) {
    let data = [];
    let kimaSessionRealtimeDataArgs = {sessionId: _sessionId, isUser: 0};
    return SensorData.find({
        sessionId: _sessionId,
        isUser: 0
    }).sort({timestamp: 'desc'}).lean().exec(function (err, sessionData) {

        if (err) {
            console.log(err);
            return null;
        }
        console.log("got a result from get session data");
        session.data = Array.from(sessionData);
        // console.log(session.data);
        //data = Array.from(sessionData) ;

        // return sessionData;
    });

    // console.log("Data");
    // console.log(data);
    // return data;
}

module.exports = router;