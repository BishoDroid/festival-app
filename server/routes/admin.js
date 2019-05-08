/**
 * Created by bisho on 04/05/2019.
 */
const express = require('express');
const _ = require('underscore');
const router = express.Router();
const utils = require('../utils/utils');

let Tablet = require('../models/Tablet');

require('../db/festival-app-db');

/**
 * Gets the avaialble tablets for the specific type
 * @param type - kima or symb
 * @param limit - 4 for kima, 8 for symb
 * @param res - the response object
 */
let returnTablets = function (type, limit, res) {
    let query = type === 'all' ? {} : {type: type};
    Tablet.find(query, function (err, docs) {
        if (err) {
            console.log(err);
            return res.json({code: 500, status: 'ERR', msg: err});
        } else {
            return res.json({code: 200, status: 'OK', data: docs});
        }
    });
};

let createTabletFromBody = function (body) {
    let tablet = new Tablet();
    console.log(body);
    tablet.type = body.type;
    tablet.tabletId = body.tabletId;
    tablet.isTaken = true;
    return tablet;
};

let createTablet = function (tablet, type, limit, res) {
    Tablet.find({type: type}, function (err, docs) {
        if (err) {
            console.log(err);
            return res.json({code: 500, status: 'ERR', msg: err});
        } else {
            console.log('Started adding new tablet ' + tablet.tabletId);
            let count = docs.length;
            let diff = limit - count;
            console.log("limit: " + limit + " ===== count: " + count + " ===== diff: " + diff);
            if (diff > 0) {
                console.log(tablet);
                Tablet.findOneAndUpdate({type: 'none'}, {
                    $set: {
                        tabletId: tablet.tabletId,
                        type: tablet.type,
                        isTaken: tablet.isTaken
                    }
                }, {new: true}, function (err, doc) {
                    if (err) {
                        return res.json({code: 500, status: 'ERR', msg: err});
                    } else {
                        if (doc) {
                            console.log('Updated: ' + doc.tabletId);
                            return res.json({
                                code: 200,
                                status: 'OK',
                                msg: 'Saved new tablet ' + doc.tabletId,
                                data: doc
                            })
                        }
                    }
                })
            } else {
                return res.json({code: 200, status: 'OK', msg: 'All tablets for ' + type + ' are taken'});
            }
        }
    });
};

let resetTablets = function (type, res) {
    Tablet.find({type: type}, function (err, docs) {
        if (err) {
            console.log(err);
            return res.json({code: 500, status: 'ERR', msg: err});
        } else {
            console.log('Found ' + docs.length + ' ' + type + ' tablets');
            docs.forEach(function (tablet) {
                Tablet.findOneAndUpdate({_id: tablet._id}, {
                    $set: {
                        tabletId: 'tablet-',
                        type: 'none',
                        isTaken: false
                    }
                }, {new: true}, function (err, newDoc) {
                    if (err) {
                        console.log(err);
                        return res.json({code: 500, status: 'ERR', msg: err});
                    } else {
                        console.log("Successfully reset " + tablet.tabletId + " of type " + tablet.type);
                    }
                })
            });
            utils.sleep(1000).then(() => {
                return res.json({code: 200, status: 'OK', msg: 'Successfully reset tablets of type ' + type});
            })
        }
    });
};

router.route('/admin/tablets/:type')
    .get(function (req, res) {
        let type = req.param('type');
        let limit = type === 'kima' ? 4 : 8;
        console.log('Getting tablets for ' + type);
        returnTablets(type, limit, res);
    })
    .post(function (req, res) {
        let type = req.param('type');
        let tablet = createTabletFromBody(req.body);
        let limit = type === 'kima' ? 4 : 8;
        console.log('Creating tablet for ' + type);
        createTablet(tablet, type, limit, res);
    });

router.route('/admin/tablets/reset/:type')
    .get(function (req, res) {
        let type = req.param('type');
        resetTablets(type, res);
    });
router.route('admin/password')
    .get(function (req, res) {
        let client = req.header('client-id');
        if (client.includes('tablet')) {
            Tablet.findOne({type: 'password'}, function (err, password) {
                if (err) {
                    console.log(err);
                    return res.json({code: 500, status: 'ERR', msg: err});
                } else {
                    return res.json({code: 200, status: 'OK', data: {password: password.tabletId}});
                }
            })
        } else {
            return res.json({code: 401, status: 'AuthErr', msg: 'Unauthorized. Unknown client'});
        }
    })
    .post(function (req, res) {
        let client = req.header('client-id');
        let password = req.body.password;
        if (client.includes('tablet')) {
            Tablet.findOneAndUpdate({type: 'password'}, {$set: {tabletId: password}}, {
                upsert: true,
                new: true
            }, function (err, pass) {
                if (err) {
                    console.log(err);
                    return res.json({code: 500, status: 'ERR', msg: err});
                } else if (pass) {
                    return res.json({code: 200, status: 'OK', data: {password: pass}});
                }
            });
        }
    });
module.exports = router;