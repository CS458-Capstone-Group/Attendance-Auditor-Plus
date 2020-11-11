const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const organizerEditLogSchema = new Schema({
    //logID: Number, //PRIMARY KEY
    organizerID: Number, //FOREIGN KEY
    eventID: Number, //FOREIGN KEY
    logDescription: String //NOT NULL
});

module.exports = mongoose.model("organizerEditLog", organizerEditLogSchema);