
/**
 * Created by bisho on 28/04/2019.
 */
const express = require('express');

const router = express.Router();
const osc = require('osc');
const lokiSingleton = require('../db/festival-app-db-in-loki');

let db = lokiSingleton.getInstance();

let sessions = db.getCollection('sessions');
let conf = db.getCollection('config');

let sessionId = null;
let session = undefined;
let activeKimaSession = undefined;
let activeSymbiosisSession = undefined ;
require('../db/festival-app-db');
let ExperimentSession = require('../models/ExperimentSession');
let SensorData = require('../models/SensorData');
let SymbiosisSensorData = require('../models/SymbiosisData')
let User = require('../models/User');
let log = require('../utils/logger');

let _localAddress = "167.99.85.162" ;
//let _localAddress = "127.0.0.1" ;
let _remoteAddress = "127.0.0.0" ;

let kimaUdpPort = new osc.UDPPort({
    localAddress: _localAddress,
    localPort: 5000
});

let symbiosisUdpPort = new osc.UDPPort({


     localAddress :  _localAddress,
     localPort: 5001,
    remoteAddress : _remoteAddress,
   // remoteAddress : "to change",
    remotePort : 5000
});



router.route('/kima/:command')
    .get(function (req, res) {
        sessionId = req.header('session-id');

        session =  sessions.findOne({ 'sessionId' : sessionId });
        if (session.sessionType === "kima") {
            activeKimaSession = session;
        }else if (session.sessionType === "symbiosis") {
            activeSymbiosisSession = session;
        }


        console.log(session);

        let command = req.params.command;
        function startSession(session) {
            session.status = "recording";
            sessions.update(session);
        }

        function stopSession(session) {
            if (session.sessionType === "symbiosis") {
                session.status = "waiting_summary";
            }else {
                session.status = "stopped";
            }

            sessions.update(session);
        }
        switch (command) {
            case 'start':
                if (session.sessionType === "kima") startSession(activeKimaSession);
                if (session.sessionType === "symbiosis") startSession(activeSymbiosisSession);
                console.log("start recording for session : " + session.sessionId);
                if (session.recordingStartTime == undefined) {
                    session.recordingStartTime = new Date();
                }
                log(session.sessionType,'OK', "session " + session.sessionId  + " started recording");
                return res.json({
                    code: 200,
                    status: 'OK',
                    msg: 'Started listening on ' + getIPAddresses() + ' Port ' + kimaUdpPort.options.localPort
                });

                break;
            case 'stop':
                if (session.sessionType === "kima") stopSession(activeKimaSession);
                if (session.sessionType === "symbiosis") stopSession(activeSymbiosisSession);

                console.log("start recording for session : " + session.sessionId);
                session.recordingStopTime = new Date();
                updateSession(session);
                log(session.sessionType,'OK', "session " + session.sessionId  + " stopped recording");
                return res.json({
                    code: 200,
                    status: 'OK',
                    msg: 'Successfully stopped listening to UPD events'
                });
                break;

            default:
        }

    });

let getIPAddresses = function () {
    let os = require('os'),
        interfaces = os.networkInterfaces(),
        ipAddresses = [];

    for (let deviceName in interfaces) {
        let addresses = interfaces[deviceName];
        for (let i = 0; i < addresses.length; i++) {
            let addressInfo = addresses[i];
            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};

kimaUdpPort.open();
symbiosisUdpPort.open();

kimaUdpPort.on("ready", function () {
    let ipAddresses = getIPAddresses();

    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", kimaUdpPort.options.localPort);
    });
});


function formMessage( _address ,_type,_value) {

    message = {
        address: _address,
        args : [
            {
                type: _type,
                value: _value
            }
        ]
    }

    return message;

}

symbiosisUdpPort.on("ready", function () {
    let ipAddresses = getIPAddresses();

    console.log("Listening for OSC over UDP symbiosis.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", symbiosisUdpPort.options.localPort);
    });

    let latestSymbiosisSession;
    let _message;
    let sendOscStatusAndTime = setInterval(() => {

         latestSymbiosisSession =  getLatestSession('desc',"symbiosis");

        if (!latestSymbiosisSession) {
            _message = formMessage("/server/session","i",0);
        }

        if (latestSymbiosisSession) {

            if (latestSymbiosisSession.status === "ready") {
                _message = formMessage("/server/session","i",1);
            }
            else if(latestSymbiosisSession.status === "recording")
            {
                _message = formMessage("/server/session","i",2);
            }    else if(latestSymbiosisSession.status === "stopped")
            {
                _message = formMessage("/server/session","i",3);
            }

        }
        let dateTime =formMessage("/server/clock","i",  + new Date() );
        symbiosisUdpPort.send( dateTime );
        symbiosisUdpPort.send( _message );

    }, 2000);







});




function hasNumber(myString) {
    return /\d/.test(myString);
}

kimaUdpPort.on("message", function (oscMessage) {

    if (oscMessage.address === "/server/session" || oscMessage.address === "/server/clock"){
        console.log(oscMessage);
    }

    if (!activeKimaSession || activeKimaSession.status !== "recording") {
        return ;
    }

    let data = new SensorData();
    data.readingType = oscMessage.address;
    data.value = oscMessage.args[0];
    data.timestamp = new Date();

    let isAttachedToUser = hasNumber(oscMessage.address) ;
    if (isAttachedToUser) {

        let userNumber = oscMessage.address.match(/\d+/)[0] ;
        let userIndex = userNumber -1 ;

        createDataArrayIfItDoesntExist (Session.users[userIndex].data);

        activeKimaSession.users[userIndex].data.push(data);

        if (activeKimaSession.users[userIndex].data.length %10 === 0 )  {  log(activeKimaSession.sessionType,'OK', "session " + activeKimaSession.sessionId  + " saved " + activeKimaSession.users[userIndex].data.length + " record for user : " + userNumber );  }
    }
    else { // attached to session

        createDataArrayIfItDoesntExist (activeKimaSession.sessionData);
        activeKimaSession.sessionData.push(data);

        if (activeKimaSession.sessionData.length %10 === 0 ) {   log(activeKimaSession.sessionType,'OK', "session " + activeKimaSession.sessionId  + " saved " + activeKimaSession.sessionData.data.length + " record for session" ); }

    }

  //  updateSession(session); // only update at the end of the session

});

symbiosisUdpPort.on("message", function (oscMessage) {
    console.log(oscMessage);

    let recording = activeSymbiosisSession.status === "recording" ;
    let waitingSummary  = activeSymbiosisSession.status === "waiting_summary" ;


    if (!activeSymbiosisSession || ( !recording && !waitingSummary ) ) {

        return ;
    }

    let symbiosisRealTimeData = new SymbiosisSensorData ();
    symbiosisRealTimeData.sessionId = activeKimaSession.id;
    symbiosisRealTimeData.readingType = oscMessage.address;
    symbiosisRealTimeData.value = oscMessage.args[0];
    symbiosisRealTimeData.timestamp = new Date();

    let data = new SensorData();
    data.readingType = oscMessage.address;
    data.value = oscMessage.args[0];
    data.timestamp = new Date();

    let isAttachedToUser = hasNumber(oscMessage.address) ;
    let isSummaryData = oscMessage.address.includes("summary");

    if (isAttachedToUser) {

        let userNumber = oscMessage.address.match(/\d+/)[0] ;
        let userIndex = userNumber -1 ;

        createDataArrayIfItDoesntExist(activeSymbiosisSession.users[userIndex].data);
        createDataArrayIfItDoesntExist(activeSymbiosisSession.users[userIndex].summaryData);

        isSummaryData ? activeSymbiosisSession.users[userIndex].summaryData.push(data) : saveSymbiosisRealTimeData (symbiosisRealTimeData);

    }
    else { // is attached to session

        createDataArrayIfItDoesntExist (activeSymbiosisSession.sessionData);
        createDataArrayIfItDoesntExist (activeSymbiosisSession.summaryData);

        isSummaryData ?  activeSymbiosisSession.summaryData.push(data) :  saveSymbiosisRealTimeData (symbiosisRealTimeData) ;

    }

    //  updateSession(session);

});



kimaUdpPort.on("error", function (err) {
   // console.log(err);
});

symbiosisUdpPort.on("error", function (err) {
    // console.log(err);
});

let updateSession = function (session) {
    ExperimentSession.findOneAndUpdate(
        {'_id': session._id}
        , session, {new: true}
        , function (err, doc) {
        if (err) {
            return res.json({status: 'ERR', code: 500, msg: err});
            console.log(err);
        }
        //console.log('Saved record');
    });
};


let getLatestSession = function (sorting,sessionType) {
    if (!sessions.data) return null;
    //  return sorting === 'asc' ? sessions.data[0] : sessions.data[sessions.count() - 1];
    if (sorting === 'asc' ){

        for (let index = 0 ; index < sessions.data.length ; index++){
            if (sessions.data[index].sessionType === sessionType )
            {
                return sessions.data[index];
            }
        }
    } else {
        for (let index = sessions.count() - 1 ; index >= 0 ; index--){
            if (sessions.data[index].sessionType === sessionType )
            {
                return sessions.data[index];
            }
        }
    }

    return null; // just in case

};

let saveSymbiosisRealTimeData = function (symbiosisRealTimeData) {

    symbiosisRealTimeData.save(function (err) {
        if (err){
            console.log("error");
        }
        log(activeKimaSession.sessionType,'OK', "session " + activeKimaSession.sessionId  + " data has been stored");

    });

}


let createDataArrayIfItDoesntExist = function (dataArray) {

    if (!dataArray || dataArray === 0) {
        dataArray = [];
    }


}


module.exports = router;