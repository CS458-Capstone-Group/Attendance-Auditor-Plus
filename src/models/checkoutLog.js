const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const checkoutLogSchema = new Schema({
    //checkoutID: Number //PRIMARY KEY
    itemID: Number, //FOREIGN KEY
    memberID: Number, //FOREIGN KEY
    checkoutDate: Date, //NOT NULL
    checkoutReturnDate: Date 
});

module.exports = mongoose.model("checkoutLog", checkoutLogSchema);