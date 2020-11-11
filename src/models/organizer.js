const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const organizerSchema = new Schema({
    //organizerID: Number, //PRIMARY KEY
    memberID: Number, //FOREIGN KEY
    isAdmin: Boolean //NOT NULL
});

module.exports = mongoose.model("organizer", organizerSchema);