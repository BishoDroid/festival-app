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

app.listen(port,function () {
    console.log("Server started on port "+port);
});
