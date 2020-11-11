const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const memberSchema = new Schema({
    //memberID: Number, //PRIMARY KEY
    fname: String, //NOT NULL
    lname: String, //NOT NULL
    email: String,
    phone: String,
    department: String,
    category: String //NOT NULL
});

module.exports = mongoose.model("member", memberSchema);