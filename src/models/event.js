const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const eventSchema = new Schema({
    title:  String, //NOT NULL
    description: String,
    datetime: Date, //NOT NULL
    capacity: Number,
    location: String,
    attendees: [{
        isMember: Boolean, //NOT NULL
        id: String //NOT NULL
    }],
    facilitators: [{
        isMember: Boolean, //NOT NULL
        id: String //NOT NULL
    }]
});

module.exports = mongoose.model("event", eventSchema);