const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const userSchema = new Schema({
    fname: String, //NOT NULL
    lname: String, //NOT NULL
    email: String,
    phone: String,
    department: String,
    category: String, //NOT NULL (guest, student, faculty, staff, classified, organizer, admin)
    password: String
});

module.exports = mongoose.model("user", userSchema);