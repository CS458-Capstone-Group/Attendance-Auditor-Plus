const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const eventSchema = new Schema({
    //eventID: Number //PRIMARY KEY
    title:  String, //NOT NULL
    description: String,
    datetime: Date, //NOT NULL
    capacity: Number,
    location: String
});

module.exports = mongoose.model("event", eventSchema);