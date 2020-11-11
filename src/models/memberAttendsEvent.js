const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const memberAttendsEventSchema = new Schema({
memberID: Number, //FOREIGN KEY
eventID: Number, //FOREIGN KEY
didRSVP: Boolean, //??NOT NULL??
didAttend: Boolean //??NOT NULL??
//primary key(memberID, eventID)
});

module.exports = mongoose.model("memberAttendsEvent", memberAttendsEventSchema);