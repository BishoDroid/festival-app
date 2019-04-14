/**
 * Created by bisho on 29/01/2017.
 */

var express = require('express');
var router = express.Router();

require('../db/festival-app-db');
var PreQuest = require('../models/PreQuestionaire');
var PostQuest = require('../models/PostQuestionnaire');



var getSkills = function (skill) {
    var schema = new Skill();
    schema.title = skill.title;
    schema.percentage = skill.percentage;
    schema.titleColor = skill.titleColor;
    schema.barColor = skill.barColor;
    return schema;
};
module.exports = router;
