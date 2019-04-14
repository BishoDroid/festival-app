/**
 * Main server
 * @author bishodroid
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const serveStatic = require('serve-static');
const  fileUpload = require('express-fileupload')

//These routes will handle requests coming to them
const index = require('./server/routes/index');
const projects = require('./server/routes/projects');
const skills = require('./server/routes/skills');
const about = require('./server/routes/aboutme');
const callback = require('./server/routes/callback');
const auth = require('./server/utils/auth');

const util = require('./server/utils/util');

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
app.use(bodyParser({limit: '2mb'}));
app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '2mb'}));
app.use(cors(corsOptions));

// app.use(auth.checkJwt);
app.use(serveStatic(util.FILES_DIR));
app.use(fileUpload());
app.use('/',index);
app.use('/api',projects);
app.use('/api', skills);
app.use('/api', about);
app.use('/callback', callback);

app.listen(port,function () {
    console.log("Server started on port "+port);
});
