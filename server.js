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
const session = require('./server/routes/session');
const kima = require('./server/routes/kima');
const admin = require('./server/routes/admin');
const utils = require('./server/utils/utils');


const corsOptions = [
    {
        origin: 'http://localhost:4200/',
        optionsSuccessStatus: 200
    }
];
const port = 3001;
const app = express();



let option = process.argv[2]
utils.createTablets(option);


//body parser middleware
app.use(cors(corsOptions));
app.use(bodyParser());
// api end points
app.use('/', index);
app.use('/api', user);
app.use('/api', session);
app.use('/api', kima);
app.use('/api', admin);

app.listen(port,function () {
    console.log("Server started on port " + port);
});
