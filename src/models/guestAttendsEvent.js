const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const guestAttendsEventSchema = new Schema({
    guestID: Number, //FOREIGN KEY
    eventID: Number //FOREIGN KEY
    //primary key(guestID, eventID)
});

module.exports = mongoose.model("guestAttendsEvent", guestAttendsEventSchema);