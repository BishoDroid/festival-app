
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
let User = require('../models/User');
let log = require('../utils/logger');

let kimaUdpPort = new osc.UDPPort({
   //  localAddress: "115.132.45.109" ,
    localAddress: "127.0.0.1",
   // localAddress :  "167.99.85.162",
    localPort: 5000
});

let symbiosisUdpPort = new osc.UDPPort({

   // localAddress: "127.0.0.1",
     localAddress :  "167.99.85.162",
     localPort: 5001,
    remoteAddress : "127.0.0.1",
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
            session.status = "stopped";
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


    let _message;
    let sendOscStatusAndTime = setInterval(() => {

        let latestSymbiosisSession =  getLatestSession('desc',"symbiosis");

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
   // console.log(oscMessage);
        if (oscMessage.address === "/server/session" || oscMessage.address === "/server/clock"){
            console.log(oscMessage);
        }
  //  console.log(oscMessage);
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

        if (!session.users[userIndex].data || session.users[userIndex].data.length === 0) {
            session.users[userIndex].data = [];
        }

        session.users[userIndex].data.push(data);
        if (session.users[userIndex].data.length %10 === 0 )
        {
            log(session.sessionType,'OK', "session " + session.sessionId  + " saved " + session.users[userIndex].data.length + " record for user : " + userNumber );
        }
    }
    else {

        if (!session.sessionData || session.sessionData.length === 0) {
            session.sessionData = [];
        }
        session.sessionData.push(data);
        if (session.sessionData.data.length %10 === 0 )
        {
            log(session.sessionType,'OK', "session " + session.sessionId  + " saved " + session.sessionData.data.length + " record for session" );
        }

    }

  //  updateSession(session);

});

symbiosisUdpPort.on("message", function (oscMessage) {


    if (!activeSymbiosisSession || activeSymbiosisSession.status !== "recording") {
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

        if (!session.users[userIndex].data || session.users[userIndex].data.length === 0) {
            session.users[userIndex].data = [];
        }

        session.users[userIndex].data.push(data);
    }
    else {

        if (!session.sessionData || session.sessionData.length === 0) {
            session.sessionData = [];
        }
        session.sessionData.push(data);

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
    ExperimentSession.findOneAndUpdate({'_id': session._id}, session, {new: true}, function (err, doc) {
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
module.exports = router;