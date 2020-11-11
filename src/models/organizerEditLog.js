const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const organizerEditLogSchema = new Schema({
    organizerID: String, //FOREIGN KEY
    logDescription: String //NOT NULL
});

module.exports = mongoose.model("organizerEditLog", organizerEditLogSchema);