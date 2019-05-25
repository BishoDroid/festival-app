/**
 * Created by bisho on 04/05/2019.
 */

let Tablet = require('../models/Tablet');

let sleepFunc = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};
let createFunc = function (force) {
    if(force){
        for (let i = 1; i <= 12; i++) {
            let tablet = new Tablet();
            Tablet.find(function (err, doc) {
                if (err) console.log(err);
                if (doc.length > 0) {
                    console.log('We already have tablets created, wont create.');
                } else {
                    tablet.tabletId = 'free-tablet';
                    tablet.type = 'none';
                    tablet.isTaken = false;
                    tablet.save(function (err) {
                        if (err) console.log('Error: ' + err);
                        console.log('Created ' + tablet.tabletId);
                    });
                }
            })
        }
    }
};

let all = {
    sleep: sleepFunc,
    create: createFunc(false),
    createTablets: function (force) {
        console.log("OUT "+force)
        if(force === '--force'){
            Tablet.deleteMany({}, function (err, docs) {
                console.log('--force option was used, deleted all tablets');
                //To wait for all the tablets to be deleted
                sleepFunc(500).then(() => {
                    console.log("TAB "+force)
                    createFunc(true);
                })
            });
        }else{
            console.log("NO "+force)
            createFunc(true);
        }
    }
};


module.exports = all;