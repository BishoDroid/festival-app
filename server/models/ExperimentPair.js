/**
 * Created by bisho on 14/04/2019.
 * This pair will contain the data of the two users participating in one session
 * and the level of harmony reached between them
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('User');
var SensorData = require('SensorData');

var user1 = new User();
var user2 = new User();
var harmonyData = new SensorData();

var experimentPair = new Schema({
    children: [user1, harmonyData, user2]
});

module.exports = mongoose.model('ExperimentPair', experimentPair);
