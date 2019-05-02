/**
 * Created by bisho on 28/04/2019.
 */
/**
 * Created by bisho on 28/04/2019.
 */
const express = require('express');

const router = express.Router();
const osc = require('osc');
// in memory db for storing sessions temporarily


const lokiSingleton = require('../db/festival-app-db-in-loki');

var db = lokiSingleton.getInstance();

var sessions = db.getCollection('sessions');
var conf = db.getCollection('config');

var sessionId = null;
var session = undefined;
require('../db/festival-app-db');
var ExperimentSession = require('../models/ExperimentSession');
var SensorData = require('../models/SensorData');

var udpPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: 5000
});

router.route('/kima/:command')
    .get(function (req, res) {
        sessionId = req.header('session-id');

        let canRecord = conf.findOne({type : 'canRecord'});
        let currentMicSession = conf.findOne({type : 'currentMicSession'});

        session =  sessions.findOne({ 'sessionId' : sessionId });

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

var getIPAddresses = function () {
    var os = require('os'),
        interfaces = os.networkInterfaces(),
        ipAddresses = [];

    for (var deviceName in interfaces) {
        var addresses = interfaces[deviceName];
        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];
            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};

udpPort.open();

udpPort.on("ready", function () {
    var ipAddresses = getIPAddresses();

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
    var data = new SensorData();
    switch (oscMessage.address) {
        case '/frequency1':
        case '/amplitude1':
            data.readingType = oscMessage.address;
            data.value = oscMessage.args[0];
            data.timestamp = new Date();
            if (!session.user1.data || session.user1.data.length === 0) {
                session.user1.data = [];
            }
            session.user1.data.push(data);
            updateSession(session);
            break;

        case '/frequency2':
        case '/amplitude2':
            data.readingType = oscMessage.address;
            data.value = oscMessage.args[0];
            data.timestamp = new Date();
            if (!session.user2.data || session.user2.data.length === 0) {
                session.user2.data = [];
            }
            session.user2.data.push(data);
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
    console.log(err);
});

var updateSession = function (session) {
    ExperimentSession.findOneAndUpdate({'_id': session._id}, session, {new: true}, function (err, doc) {
        if (err) return res.json({status: 'ERR', code: 500, msg: err});

        console.log('Saved record');
    });
};
module.exports = router;