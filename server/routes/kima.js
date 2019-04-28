/**
 * Created by bisho on 28/04/2019.
 */
/**
 * Created by bisho on 28/04/2019.
 */
const express = require('express');
const router = express.Router();
const osc = require('osc');
var pairId = null;

require('../db/festival-app-db');
var ExperimentPair = require('../models/ExperimentPair');
var udpPort = new osc.UDPPort({
    localAddress: "127.0.0.1",
    localPort: 5000
});

router.route('/kima/:command')
    .get(function (req, res) {
        var command = req.params.command;
        pairId = req.header('pair-id');

        switch (command) {
            case 'start':
                udpPort.open();
                return res.json({
                    code: 200,
                    status: 'OK',
                    msg: 'Started listening on ' + getIPAddresses() + ' Port ' + udpPort.options.localPort
                });

                break;
            case 'stop':
                udpPort.close();
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
    var mic = oscMessage

});

udpPort.on("error", function (err) {
    console.log(err);
});

module.exports = router;