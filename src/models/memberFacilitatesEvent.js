const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const memberFacilitatesEventSchema = new Schema({
memberID: Number, //FOREIGN KEY
eventID: Number //FOREIGN KEY
//primary key(memberID, eventID)
});

module.exports = mongoose.model("memberFacilitatesEvent", memberFacilitatesEventSchema);