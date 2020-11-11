const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const checkoutLogSchema = new Schema({
    itemID: String, //FOREIGN KEY
    memberID: String, //FOREIGN KEY
    checkoutDate: Date, //NOT NULL
    checkoutReturnDate: Date 
});

module.exports = mongoose.model("checkoutLog", checkoutLogSchema);