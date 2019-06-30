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

            sessions.forEach(session =>  {

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
                            getNumberOfHarmonies (sessionData,session);
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



                // loop through users
                session.users.forEach((user, kimaUserIndex) => {


                    let index = kimaUserIndex  +1 ;
                    if (session.sessionType != 'kima') {
                        return;
                    }
                    console.log("Im not user 2 " ,index );
                    userIdString = (user._id).toString();

                    console.log("userIdString" + userIdString);
                    dataPromises.push((callback) => {
                        kimaUserRealtimeDataArgs = { sessionId : sessionIdString , userNumber : index , isUser: 1, sessionType: 'kima'};
                        console.log(kimaUserRealtimeDataArgs);
                        SensorData.find(kimaUserRealtimeDataArgs)
                            .sort({timestamp: 'desc'})
                            .lean()
                            .exec((err, userData) => {
                                if (err) {
                                    return callback(err);
                                }
                                user.averageAmplitude = getAverageAmplitude(userData) ;

                                callback(null, session);
                            });
                    });

                    //console.log("user Number :" + _userNumber);



                });

            }) // for sessions

            //
            async.parallel(dataPromises, function (err, result) {

                if (err) {
                    return console.log(err);
                }


                sessions.forEach(session =>
                {

                });




                return res.json({status: 'OK', code: 200, sessions: sessions});

            });

        })
    })
;

function getAverageAmplitude(userData) {
    var avg;
    var sum = 0;
    if (!userData.length) return 0;

    for (var i = 0; i < userData.length; i++) {

        if (userData[i].readingType.includes("/amplitude")) {

            sum += parseInt(userData[i].value, 10); //don't forget to add the base

        }

    }

    avg = sum / userData.length;

    console.log("average : " + avg);
    return avg;

}

function getNumberOfHarmonies(sessionData, session)
{
    let third = sessionData.filter(data => data.readingType.includes ("third"));
    let fifth = sessionData.filter(data => data.readingType.includes ("fifth"));
    let octave = sessionData.filter(data => data.readingType.includes ("octave"));

    let thirdTimeStamps = getHarmonyTimestamps (third);
    let fifthTimeStamps = getHarmonyTimestamps (fifth);
    let octaveTimeStamps = getHarmonyTimestamps (octave);

    let groupedThirdHarmonies = groupHarmonies (thirdTimeStamps);
    let groupedFifthHarmonies = groupHarmonies (fifthTimeStamps);
    let groupedOctaveHarmonies = groupHarmonies (octaveTimeStamps);

    let numberOfThirdHarmonies = groupedThirdHarmonies.length;
    let numberOfFifthHarmonies = groupedFifthHarmonies.length;
    let numberOfOctaveHarmonies = groupedOctaveHarmonies.length;

    let durationOfAllThirdHarmonies = getDurationOfGroupedHarmonies(groupedThirdHarmonies);
    let durationOfAllFifthHarmonies = getDurationOfGroupedHarmonies(groupedFifthHarmonies);
    let durationOfAllOctaveHarmonies = getDurationOfGroupedHarmonies(groupedOctaveHarmonies);

    let durationOfAllHarmonies = durationOfAllThirdHarmonies + durationOfAllFifthHarmonies + durationOfAllOctaveHarmonies ;


    let _totalNumberOfHarmonies = numberOfThirdHarmonies + numberOfFifthHarmonies + numberOfOctaveHarmonies ;
    let _averageDurationOfHarmony = durationOfAllHarmonies / _totalNumberOfHarmonies ;


    session.totalNumberOfHarmonies = _totalNumberOfHarmonies ;
    session.averageDurationOfHarmony = _averageDurationOfHarmony ;


}


function getHarmonyTimestamps (data) {

    let timestamps = [];
    let timestamp;
    data.forEach(d => {
        timestamp = Math.round(d.timestamp.getTime() / 1000);
        timestamps.push(timestamp ) ;
    });

   return timestamps.sort((a, b) => a - b);
}


function groupHarmonies (harmoniesTimestamps)
{
    var result = [], temp = [];
    let difference;
    for (var i = 0; i < harmoniesTimestamps.length; i += 1) {
        if (difference !== (harmoniesTimestamps[i] - i)) {
            if (difference !== undefined) {
                result.push(temp);
                temp = [];
            }
            difference = harmoniesTimestamps[i] - i;
        }
        temp.push(harmoniesTimestamps[i]);
    }

    if (temp.length) {
        result.push(temp);
    }

    return result;

}


function getDurationOfGroupedHarmonies (groupedHarmonies)
{
    let duration = 0 ;
    groupedHarmonies.forEach(harmony => {
        duration = duration + harmony.length;
    });

    return duration;
}
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