const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//import mongoose from 'mongoose';
//const { Schema } = mongoose;

const eventSchema = new Schema({
    title:  String, //NOT NULL
    description: String,
    datetime:   Date, //NOT NULL
    capacity: Number,
    location: String
});

//module.exports = eventSchema;
module.exports = mongoose.model("event", eventSchema);