const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const inventoryItemSchema = new Schema({
    name: String, //NOT NULL
    description: String, 
    sn: String,
    checkedOut: String,
    checkedOutBy: String
});

module.exports = mongoose.model("inventoryItem", inventoryItemSchema);