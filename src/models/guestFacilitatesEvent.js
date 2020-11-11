const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const guestFacilitatesEventSchema = new Schema({
    guestID: Number, //FOREIGN KEY
    eventID: Number //FOREIGN KEY
    //primarykey(guestID, eventID)
});

module.exports = mongoose.model("guestFacilitatesEvent", guestFacilitatesEventSchema);