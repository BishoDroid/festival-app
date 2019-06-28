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
    if (sessions.data) {
                // console.log('Found ' + sessions.data.length + ' sessions');
                return res.json(sessions.data);
            }
        }
        );


 router.route('/sessions/all')
 .get(function (req, res){

    ExperimentSession.find({}).sort({timestamp: 'desc'}).lean().exec(function (err, sessions) {

        if(sessions){
            dataPromises = [];
            for (const session of sessions) {

                let sessionIdString = (session._id).toString();
                let findArgs = { sessionId :sessionIdString , isUser : 0 } ;
                function getSessionData (callback) 
                { 
                     SensorData.find( indArgs)
                    .sort({timestamp: 'desc'})
                    .lean()
                    .exec( (err, sessionData) => {
                        if (err) { return callback(err) ; }
                        session.sessionDatas = sessionData;
                        callback(null,session);
                    });
                }


                dataPromises.push( (callback) => 
                { 
                     SensorData.find( indArgs)
                    .sort({timestamp: 'desc'})
                    .lean()
                    .exec( (err, sessionData) => {
                        if (err) { return callback(err) ; }
                        session.sessionDatas = sessionData;
                        callback(null,session);
                    });
                });
            } // for sessions 

            async.parallel(dataPromises, function(err, result) {

                if (err) {  return console.log(err); }
                return res.json({status: 'OK',  code: 200, sessions: sessions});
               
            });


        }
    })
});


 async function getSessionData (_sessionId, session)  {
    let data = [];
    let findArgs = { sessionId : _sessionId , isUser : 0 } ;
    return  SensorData.find (  { sessionId : _sessionId , isUser : 0 } ).sort({timestamp: 'desc'}).lean().exec(function (err, sessionData) {

        if (err) {
            console.log (err) ;
            return null;
        }
        console.log("got a result from get session data");
        session.data = Array.from(sessionData)   ;
       // console.log(session.data);
        //data = Array.from(sessionData) ;

       // return sessionData;
   });

   // console.log("Data");
   // console.log(data);
   // return data;
}
module.exports = router;