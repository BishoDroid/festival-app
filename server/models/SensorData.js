/**
 * Created by bisho on 14/04/2019.
 */
/**
 * Created by bisho on 14/04/2019.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sensorData = new Schema({
    readingType: String,
    value: Number,
    timestamp: Date
});

module.exports = mongoose.model('SensorData', sensorData);
