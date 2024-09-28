


const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    name: String,           // Bus name
    from: String,
    to: String,
    departureTime: String,  // Departure time
    route: String,          // Route
    moreInfo: String,
    cN:String// More info
});

const Bus = mongoose.model('Bus', busSchema);

module.exports = Bus;

