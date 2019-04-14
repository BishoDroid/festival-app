/**
 * Created by bisho on 14/04/2019.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PreQuestionaire = require('PreQuestionaire');
var PostQuestionaire = require('server/models/PostQuestionnaire');
var SensorData = require('SensorData');

var preQuest = new PreQuestionaire();
var data = new SensorData();
var postQuest = new PostQuestionaire();

var user = new Schema({
    userId: Number,
    children: [preQuest, data, postQuest]
});

module.exports = mongoose.model('User', user);
