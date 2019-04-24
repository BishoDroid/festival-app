/**
 * Main server
 * @author bishodroid
 */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

//These routes will handle requests coming to them
const index = require('./server/routes/index');
const user = require('./server/routes/user');
const osc = require('osc');
//const flock = require("flocking");

const corsOptions = [
  {
    origin: 'http://localhost:4200/',
    optionsSuccessStatus: 200
  },
  {
    origin: 'http://bishodroid:8090/',
    optionsSuccessStatus: 200
  }
];
const port = 3001;
const app = express();

//body parser middleware
app.use(cors(corsOptions));
app.use(bodyParser());
// api end points
app.use('/',index);
app.use('/api',user);


var getIPAddresses = function () {
  var os = require("os"),
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

var udpPort = new osc.UDPPort({
  localAddress: "127.0.0.1",
  localPort: 5000
});

udpPort.on("ready", function () {
  var ipAddresses = getIPAddresses();

  console.log("Listening for OSC over UDP.");
  ipAddresses.forEach(function (address) {
    console.log(" Host:", address + ", Port:", udpPort.options.localPort);
  });
});

udpPort.on("message", function (oscMessage) {
  console.log(oscMessage);
});

udpPort.on("error", function (err) {
  console.log(err);
});

udpPort.open();

app.listen(port,function () {
    console.log("Server started on port "+port);
});
