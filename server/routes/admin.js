/**
 * Created by bisho on 04/05/2019.
 */
const express = require('express');
const router = express.Router();
const utils = require('../utils/utils');

let Tablet = require('../models/Tablet');
let Config = require('../models/Config');

require('../db/festival-app-db');

router.route('/admin/tablets/:type')
    .get(function (req, res) {
        let type = req.param('type');
        returnTablets(type, res);
    })
    .post(function (req, res) {
        let type = req.param('type');
        let tablet = createTabletFromBody(req.body);
        let limit = type === 'kima' ? 4 : 12;
        console.log('Creating tablet for ' + type);
        createTablet(tablet, type, limit, res);
    });

router.route('/admin/tablets/reset/:type')
    .get(function (req, res) {
        let type = req.param('type');
        resetTablets(type, res);
    })
    .put(function (req, res) {
        let tabletId = req.param('type');
        resetSingleTablet(tabletId, res);
    });

router.route('/admin/config/:key')
    .get(function (req, res) {
        let client = req.header('client-id');
        let key = req.param('key');

        console.log("Client ID: " + client);
        console.log("Key: " + key);

        if (client.includes('tablet')) {
            Config.findOne({key: key}, function (err, data) {
                if (err) {
                    console.log(err);
                    return res.json({code: 500, status: 'ERR', msg: err});
                } else if (data) {
                    return res.json({code: 200, status: 'OK', data: {value: data.value}});
                } else {
                    return res.json({code: 301, status: 'OK', msg: 'No Data'});
                }
            })
        } else {
            return res.json({code: 401, status: 'AuthErr', msg: 'Unauthorized. Unknown client'});
        }
    })

    .put(function (req, res) {
        let key = req.param('key');
        let client = req.header('client-id');

        if (client.includes('tablet')) {
            switch (key) {
                case 'password':
                    updatePassword(req.body.value, res);
                    break;
                case 'is-first-run':
                    updateIsFirstRun(req.body.value, res);
                    break;
                default:
                    return res.json({code: 404, status: 'NOT FOUND', msg: 'Config' + key + ' Not found'});
            }
        } else {
            return res.json({code: 401, status: 'AuthErr', msg: 'Unauthorized. Unknown client'});
        }
    })

    .post(function (req, res) {
        let client = req.header('client-id');
        let key = req.param('key');
        let value = req.body.value;
        if (client.includes('tablet')) {
            Config.findOneAndUpdate({key: key}, {$set: {value: value}}, {upsert: true}, function (err, doc) {
                if (!err) {
                    return res.json({
                        code: 200,
                        status: 'OK',
                        msg: 'Successfully saved config ' + key + ' with value' + value
                    });
                } else {
                    return res.json({code: 500, status: 'ERR', msg: 'Error: ' + err});
                }
            })
        }
    });


router.route('/admin/tablets/:type')
    .get(function (req, res) {
        let type = req.param('type');
        // console.log('Getting tablets for ' + type + 'Size: '+ 12);
        returnTablets(type, res);
    })
    .post(function (req, res) {
        let type = req.param('type');
        let tablet = createTabletFromBody(req.body);
        let limit = type === 'kima' ? 4 : 12;
        console.log('Creating tablet for ' + type);
        createTablet(tablet, type, limit, res);
    });

router.route('/admin/tablets/reset/:type')
    .get(function (req, res) {
        let type = req.param('type');
        resetTablets(type, res);
    })
    .put(function (req, res) {
        let tabletId = req.param('type');
        resetSingleTablet(tabletId, res);
    });

router.route('/admin/config/:key')
    .get(function (req, res) {
        let client = req.header('client-id');
        let key = req.param('key');

        console.log("Client ID: " + client);
        console.log("Key: " + key);

        if (client.includes('tablet')) {
            Config.findOne({key: key}, function (err, data) {
                if (err) {
                    console.log(err);
                    return res.json({code: 500, status: 'ERR', msg: err});
                } else if (data) {
                    return res.json({code: 200, status: 'OK', data: {value: data.value}});
                } else {
                    return res.json({code: 301, status: 'OK', msg: 'No Data'});
                }
            })
        } else {
            return res.json({code: 401, status: 'AuthErr', msg: 'Unauthorized. Unknown client'});
        }
    })

    .put(function (req, res) {
        let key = req.param('key');
        let client = req.header('client-id');

        if (client.includes('tablet')) {
            switch (key) {
                case 'password':
                    updatePassword(req.body.value, res);
                    break;
                case 'is-first-run':
                    updateIsFirstRun(req.body.value, res);
                    break;
                default:
                    return res.json({code: 404, status: 'NOT FOUND', msg: 'Config' + key + ' Not found'});
            }
        } else {
            return res.json({code: 401, status: 'AuthErr', msg: 'Unauthorized. Unknown client'});
        }
    })

    .post(function (req, res) {
        let client = req.header('client-id');
        let key = req.param('key');
        let value = req.body.value;
        if (client.includes('tablet')) {
            Config.findOneAndUpdate({key: key}, {$set: {value: value}}, {upsert: true}, function (err, doc) {
                if (!err) {
                    return res.json({
                        code: 200,
                        status: 'OK',
                        msg: 'Successfully saved config ' + key + ' with value' + value
                    });
                } else {
                    return res.json({code: 500, status: 'ERR', msg: 'Error: ' + err});
                }
            })
        }
    });

router.route('/admin/auth')
    .get(function (req, res) {
        let passwd = Buffer.from(req.header('password'), 'base64').toString();

        Config.findOne({key: 'password'}, function (err, password) {
            if (err) {
                return res.status(500).send({msg: err});
            } else {
                let pass = Buffer.from(password.value, 'base64').toString();
                if (pass === passwd) {
                    return res.json({code: 200, status: 'OK', isAuthorized: true});
                } else {
                    return res.status(401).send({error: 'Unauthorized!'});
                }
            }
        });
    });


let returnTablets = function (type, res) {
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
    //console.log(body);
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

let resetSingleTablet = function (tabletId, res) {
    Tablet.findOneAndUpdate({tabletId: tabletId}, {
        $set: {
            tabletId: 'free-tablet',
            type: 'none',
            isTaken: false
        }
    }, {new: true}, function (err, newDoc) {
        if (err) {
            console.log(err);
            return res.json({code: 500, status: 'ERR', msg: err});
        } else {
            console.log("Successfully reset " + tabletId);
            return res.json({code: 200, status: 'OK', msg: 'Successfully reset tablet ' + tabletId});
        }
    })
};

let resetTablets = function (type, res) {
    Tablet.find(function (err, docs) {
        if (err) {
            console.log(err);
            return res.json({code: 500, status: 'ERR', msg: err});
        } else {
            console.log('Found ' + docs.length + ' tablets');
            docs.forEach(function (tablet) {
                Tablet.findOneAndUpdate({_id: tablet._id}, {
                    $set: {
                        tabletId: 'free-tablet',
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
                return res.json({code: 200, status: 'OK', msg: 'Successfully reset tablets'});
            })
        }
    });
};

let updatePassword = function (value, res) {
    let currentPasswordEnc = value[0]
    let newPasswordEnc = value[1];
    console.log('CUR ENC: ' + currentPasswordEnc);
    console.log('NEW ENC: ' + newPasswordEnc);

    let currentPass = Buffer.from(currentPasswordEnc, 'base64').toString();
    let newPass = Buffer.from(newPasswordEnc, 'base64').toString();
    console.log('CUR DEC: ' + currentPass);
    console.log('NEW DEC: ' + newPass);

    Config.findOne({key: 'password'}, function (err, data) {
        if (data) {
            console.log('PASS ENC: ' + data.value);
            console.log('PASS DEC: ' + Buffer.from(data.value, 'base64').toString());
            let pass = Buffer.from(data.value, 'base64').toString();
            if (pass === currentPass) {
                data.value = newPasswordEnc;
                data.save(function (err, saved) {
                    if (!err) {
                        return res.json({code: 200, status: 'OK', msg: 'Successfully saved'})
                    }
                });

            } else {
                return res.json({code: 401, status: 'ERR', msg: 'Wrong password'})
            }
        }
    });

};

let updateIsFirstRun = function (value, res) {
    Config.findOneAndUpdate({key: 'is-first-run'}, {$set: {value: value[0]}}, {
        new: true,
        upsert: true
    }, function (err, doc) {
        console.log('UPDATING');
        if (!err) {
            console.log(doc);
            return res.json({code: 200, status: 'OK', msg: 'Successfully updated config value to ' + value});
        } else {
            console.error(err);
            return res.json({code: 500, status: 'ERR', msg: 'Error: ' + err});
        }
    })
};
module.exports = router;