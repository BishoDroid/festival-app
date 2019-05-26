/**
 * Created by bisho on 26/05/2019.
 */

let Log = require('../models/Log');

let log = function (type, status, message) {
    if (areInputsValid(type, status, message)) {
        let logMsg = new Log();
        let current = new Date();
        logMsg.time = current.getFullYear() + '-' + parseInt(current.getMonth() + 1) + '-' + current.getDate() + ' ' + current.getHours() + ':' + current.getMinutes();
        logMsg.type = type;
        logMsg.status = status;
        logMsg.message = message;

        logMsg.save(function (err) {
            if (err) {
                console.log('ERROR: could not save log message\nReason: ' + err);
            } else {
                console.log('Successfully logged message');
            }
        });
    } else {
        console.log('ERROR, validation failed... Wwill not add log message');
    }
};


let areInputsValid = function (type, status, message) {
    return (type === 'kima' || type === 'symb') && (status === 'OK' || status === 'ERROR') && (message.length > 0);
};

module.exports = log;