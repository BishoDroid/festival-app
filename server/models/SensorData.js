/**
 * Created by bisho on 14/04/2019.
 */

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let sensorData = new Schema({
    readingType: String,
    value: Number,
    timestamp: Date
});

module.exports = mongoose.model('SensorData', sensorData);
