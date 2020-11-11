const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const inventoryItemSchema = new Schema({
    //itemID: Number, //PRIMARY KEY
    name: String, //NOT NULL
    description: String, 
    sn: String
});

module.exports = mongoose.model("inventoryItem", inventoryItemSchema);