
const express = require('express');

const router = express.Router();
const osc = require('osc');

// in memory database
const lokiSingleton = require('../db/festival-app-db-in-loki');
let db = lokiSingleton.getInstance();
let sessions = db.getCollection('sessions');
let conf = db.getCollection('config');

require('../db/festival-app-db');

let sessionId = null;
let session = undefined;
let activeKimaSession = undefined;
let activeSymbiosisSession = undefined ;


let ExperimentSession = require('../models/ExperimentSession');
let SensorData = require('../models/SensorData');
let SymbiosisSensorData = require('../models/SymbiosisSensorData');

let log = require('../utils/logger');

let _localAddress = "167.99.85.162" ;
//let _localAddress = "127.0.0.1" ;
let _remoteAddress = "137.74.211.12" ;

let kimaUdpPort = new osc.UDPPort({
    localAddress: _localAddress,
    localPort: 5000
});

let symbiosisUdpPort = new osc.UDPPort({
     localAddress :  _localAddress,
     localPort: 5001,
     remoteAddress : _remoteAddress,
     // remoteAddress : "to change",
     remotePort : 5001
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

        let command = req.params.command;
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

kimaUdpPort.open();
symbiosisUdpPort.open();

kimaUdpPort.on("ready", function () {
    let ipAddresses = getIPAddresses();

    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", kimaUdpPort.options.localPort);
    });
});


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
            }    else if(latestSymbiosisSession.status === "waiting_summary")
            {
                _message = formMessage("/server/session","i",3);
            }

        }
        let dateTime =formMessage("/server/clock","i",  + new Date() );

        symbiosisUdpPort.send( dateTime );
        symbiosisUdpPort.send( _message );
    }, 2000);

});


function formMessage( _address ,_type,_value) {
  let  message = {
        address: _address,
        args : [
            {
                type: _type,
                value: _value
            }
        ]
    } ;
    return message;

}

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


    let sensorData = new SymbiosisSensorData ();
    sensorData.sessionId = activeKimaSession.id;
    sensorData.readingType = oscMessage.address;
    sensorData.value = oscMessage.args[0];
    sensorData.timestamp = new Date();
    sensorData.sessionType = "kima";



    let data = new SensorData();
    data.readingType = oscMessage.address;
    data.value = oscMessage.args[0];
    data.timestamp = new Date();

    let isAttachedToUser = hasNumber(oscMessage.address) ;
    if (isAttachedToUser) {

        let userNumber = oscMessage.address.match(/\d+/)[0] ;
        let userIndex = userNumber -1 ;

        createDataArrayIfItDoesntExist (activeKimaSession.users[userIndex].data);

        sensorData.isUser =1;
        sensorData.userNumber = userNumber;
        sensorData.isSummary =   0;


       // addRealtimeDataToUser (activeKimaSession,data,userIndex);
        saveSensorData(sensorData);

        if (activeKimaSession.users[userIndex].data.length %10 === 0 )  {  log(activeKimaSession.sessionType,'OK', "session " + activeKimaSession.sessionId  + " saved " + activeKimaSession.users[userIndex].data.length + " record for user : " + userNumber );  }
    }
    else { // attached to session

        createDataArrayIfItDoesntExist (activeKimaSession.sessionData);

      //  addRealtimeSessionDataToSession (activeKimaSession,data);


        sensorData.isUser =0;
        sensorData.isSummary =   0;
        saveSensorData(sensorData);
        if (activeKimaSession.sessionData.length %10 === 0 ) {   log(activeKimaSession.sessionType,'OK', "session " + activeKimaSession.sessionId  + " saved " + activeKimaSession.sessionData.length + " record for session" ); }

    }

  //  updateSession(session); // only update at the end of the session

});

symbiosisUdpPort.on("message", function (oscMessage) {
    console.log(oscMessage);

    if (!activeSymbiosisSession ) {
        return ;
    }
    let recording = activeSymbiosisSession.status === "recording" ;
    let waitingSummary  = activeSymbiosisSession.status === "waiting_summary" ;

    if ( !recording && !waitingSummary  ) {
        return ;
    }

    let sensorData = new SymbiosisSensorData ();
    sensorData.sessionId = activeSymbiosisSession.id;
    sensorData.readingType = oscMessage.address;
    sensorData.value = oscMessage.args[0];
    sensorData.timestamp = new Date();
    sensorData.sessionType = "symbiosis";

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

        sensorData.isUser =1;
        sensorData.userNumber = userNumber;
        sensorData.isSummary = isSummaryData ? 1 : 0;

        saveSensorData(sensorData);
        //  isSummaryData ? addSummaryDataToUser(activeSymbiosisSession,data,userIndex) : addRealtimeDataToUser(activeSymbiosisSession,data,userIndex) ;

    }
    else { // is attached to session

        createDataArrayIfItDoesntExist (activeSymbiosisSession.sessionData);
        createDataArrayIfItDoesntExist (activeSymbiosisSession.summaryData);


        // isSummaryData ? addSummaryDataToSession(activeSymbiosisSession,data) :  addRealtimeSessionDataToSession(activeSymbiosisSession,data) ;
        sensorData.isUser =0;
        sensorData.isSummary = isSummaryData ? 1 : 0;
        saveSensorData(sensorData);
    }

    //  updateSession(session);

});



kimaUdpPort.on("error", function (err) {
   console.log(err);
});

symbiosisUdpPort.on("error", function (err) {
    console.log(err);
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
        log(activeSymbiosisSession.sessionType,'OK', "session " + activeSymbiosisSession.sessionId  + " data has been stored");

    });

}


let createDataArrayIfItDoesntExist = function (dataArray) {

    if (!dataArray || dataArray === 0) {
        dataArray = [];
    }
}

let addRealtimeDataToUser = function (session,data,userIndex) {

    let sessionId = session._id;
    let push = {};
    push['users.'+userIndex+'.data'] = data ;
    ExperimentSession.findOneAndUpdate(
        { _id: sessionId },
        { $push: push }, function (err, doc) {
            if (err) {
                console.log(err);
            }
            //console.log('Saved record');
        });
}


let addRealtimeSessionDataToSession = function (session,data) {

    let sessionId = session._id;
    let push = {};
    push['sessionData'] = data ;
    ExperimentSession.findOneAndUpdate(
        { _id: sessionId },
        { $push: push }, function (err, doc) {
            if (err) {
                console.log(err);
            }
            //console.log('Saved record');
        });
}

let addSummaryDataToUser = function (session,data,userIndex) {

    let sessionId = session._id;
    let push = {};
    push['users.'+userIndex+'.summaryData'] = data ;
    ExperimentSession.findOneAndUpdate(
        { _id: sessionId },
        { $push: push }, function (err, doc) {
            if (err) {
                console.log(err);
            }
            //console.log('Saved record');
        });
}

let addSummaryDataToSession = function (session,data) {

    let sessionId = session._id;
    let push = {};
    push['summaryData'] = data ;
    ExperimentSession.findOneAndUpdate(
        { _id: sessionId },
        { $push: push }, function (err, doc) {
            if (err) {
                console.log(err);
            }
            //console.log('Saved record');
        });
}

let saveSensorData = function (sensorData) {

    sensorData.save(function (err) {
        if (err){
            console.log("error");
        }
        log(activeKimaSession.sessionType,'OK', "session " + activeKimaSession.sessionId  + " data has been stored");

    });

}



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

module.exports = router;