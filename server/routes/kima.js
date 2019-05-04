/**
 * Created by bisho on 28/04/2019.
 */
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
require('../db/festival-app-db');
let ExperimentSession = require('../models/ExperimentSession');
let SensorData = require('../models/SensorData');
let User = require('../models/User');
let udpPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: 5000
});

router.route('/kima/:command')
    .get(function (req, res) {
        sessionId = req.header('session-id');

        let canRecord = conf.findOne({type : 'canRecord'});
        let currentMicSession = conf.findOne({type : 'currentMicSession'});

        session =  sessions.findOne({ 'sessionId' : sessionId });
        console.log(session);
        let command = req.params.command;

        switch (command) {
            case 'start':
                currentMicSession.value = sessionId;
                conf.update(currentMicSession);
                canRecord.value = true;
                conf.update(canRecord);
                console.log("start recording for session : " + session.sessionId);

                return res.json({
                    code: 200,
                    status: 'OK',
                    msg: 'Started listening on ' + getIPAddresses() + ' Port ' + udpPort.options.localPort
                });

                break;
            case 'stop':
                currentMicSession.value = null;
                conf.update(currentMicSession);
                canRecord.value = false;
                conf.update(canRecord);
                console.log("start recording for session : " + session.sessionId);

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

udpPort.open();

udpPort.on("ready", function () {
    let ipAddresses = getIPAddresses();

    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", udpPort.options.localPort);
    });
});

udpPort.on("message", function (oscMessage) {

    //console.log('Received new message');
    let canRecord = conf.findOne({type : 'canRecord'});
    //console.log(canRecord);
    if (!canRecord.value || !session) {
        return ;
    }
    let data = new SensorData();
    let user = new User();
    switch (oscMessage.address) {
        case '/frequency1':
        case '/amplitude1':
            data.readingType = oscMessage.address;
            data.value = oscMessage.args[0];
            data.timestamp = new Date();
            if (!session.users[0].data || session.users[0].data.length === 0) {
                session.users[0].data = [];
            }
            session.users[0].data.push(data);
            updateSession(session);
            break;

        case '/frequency2':
        case '/amplitude2':
            data.readingType = oscMessage.address;
            data.value = oscMessage.args[0];
            data.timestamp = new Date();
            if (!session.users[1].data || session.users[1].data.length === 0) {
                session.users[1].data = [];
            }
            session.users[1].data.push(data);
            updateSession(session);
            break;

        case '/third':
        case '/octave':
        case '/fifth':
            data.readingType = oscMessage.address;
            data.value = oscMessage.args[0];
            data.timestamp = new Date();
            if (!session.harmonyData || session.harmonyData.length === 0) {
                session.harmonyData = [];
            }
            session.harmonyData.push(data);
            updateSession(session);
            break;
        default:
            console.log('Unknown data type...ignoring');
    }

});

udpPort.on("error", function (err) {
   // console.log(err);
});

let updateSession = function (session) {
    ExperimentSession.findOneAndUpdate({'_id': session._id}, session, {new: true}, function (err, doc) {
        if (err) return res.json({status: 'ERR', code: 500, msg: err});

        console.log('Saved record');
    });
};
module.exports = router;