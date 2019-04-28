/**
 * Created by bisho on 28/04/2019.
 */
/**
 * Created by bisho on 28/04/2019.
 */
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const osc = require('osc');
// in memory db for storing pairs temporarily
const dirty = require('dirty');
var data = dirty('pair');

var pairId = null;

require('../db/festival-app-db');
var ExperimentPair = require('../models/ExperimentPair');
var SensorData = require('../models/SensorData');
var udpPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: 5000
});

router.route('/kima/:command')
    .get(function (req, res) {
        pairId = req.header('pair-id');
        var pair = data.get(pairId)
        var command = req.params.command;

        switch (command) {
            case 'start':
                console.log(pair)
                udpPort.open();
                console.log("opening");
                return res.json({
                    code: 200,
                    status: 'OK',
                    msg: 'Started listening on ' + getIPAddresses() + ' Port ' + udpPort.options.localPort
                });

                break;
            case 'stop':
                udpPort.close();
                console.log(pair)
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

udpPort.on("ready", function () {
    var ipAddresses = getIPAddresses();

    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", udpPort.options.localPort);
    });
});

udpPort.on("message", function (oscMessage) {
    console.log('Received new message');
    var data = new SensorData();
    switch (oscMessage.address) {
        case 'frequency1':
        case 'amplitude1':
            data.readingType = oscMessage.address;
            data.value = oscMessage.args[0];
            data.timestamp = new Date();
            if (!pair.user1.data || pair.user1.data.length === 0) {
                pair.user1.data = [];
            }
            pair.user1.data.push(data);
            updatePair(pair);
            break;

        case 'frequency2':
        case 'amplitude2':
            data.readingType = oscMessage.address;
            data.value = oscMessage.args[0];
            data.timestamp = new Date();
            if (!pair.user2.data || pair.user2.data.length === 0) {
                pair.user2.data = [];
            }
            pair.user2.data.push(data);
            updatePair(pair);
            break;

        case 'third':
        case 'octave':
        case 'fifth':
            data.readingType = oscMessage.address;
            data.value = oscMessage.args[0];
            data.timestamp = new Date();
            if (!pair.harmonyData || pair.harmonyData.length === 0) {
                pair.harmonyData = [];
            }
            pair.harmonyData.push(data);
            updatePair(pair);
            break;
        default:
            console.log('Unknown data type...ignoring');
    }

});

udpPort.on("error", function (err) {
    console.log(err);
});

var updatePair = function (pair) {
    ExperimentPair.findOneAndUpdate({'_id': pair._id}, pair, {new: true}, function (err, doc) {
        if (err) return res.json({status: 'ERR', code: 500, msg: err});
        data.update(pair._id, function (data) {
            return data;
        });
        console.log('Saved record');
    });
};
module.exports = router;