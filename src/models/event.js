const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const eventSchema = new Schema({
    title: String,          //NOT NULL
    description: String,
    date: Date,         //NOT NULL
    time: String,         //NOT NULL
    capacity: Number,
    location: String,
    attendees: [{
        userId: String,         //NOT NULL
        didRSVP: Boolean,   // NOT NULL
        didAttend: Boolean  // NOT NULL
    }],
    facilitators: [
        String              // NOT NULL
    ]
});

module.exports = mongoose.model("event", eventSchema);