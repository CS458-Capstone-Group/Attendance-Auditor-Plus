const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const guestSchema = new Schema({
    fname:  String, //NOT NULL
    lname: String, //NOT NULL
    email: String, 
    phone: String
});

module.exports = mongoose.model("guest", guestSchema);