const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const organizerSchema = new Schema({
    memberId: String, //FOREIGN KEY
    isAdmin: Boolean //NOT NULL
});

module.exports = mongoose.model("organizer", organizerSchema);