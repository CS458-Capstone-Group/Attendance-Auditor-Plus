/*
    module name:        /routes/api/events.js
    synopsis:           Contains route handlers for /api/events/*
    notable funtions:   all functions handle routes
*/

const express = require("express");
const Event = require("../../models/event.js");


const router = express.Router();

// Get a subset of events
router.get("/", (req, res) => {

});

// Create an event
router.post("/", (req, res) => {
    if (!req.body.title || req.body.title == "")
    {
         res.json("Enter a title instead of " + req.body);
    }
    // else if (!req.datetime || req.date == "")
    // {
    //      res.json("Enter a datetime");
    // }
    else
    {
         var event = new Event({
            title: req.body.title, 
            description: req.body.description,
            datetime: req.body.datetime,
            capacity: req.body.capacity,
            location: req.body.location
        });
        
        event.save((err)=>{
            res.json(err);
        });
        res.send("200");
    }
});

// Get a specific event
router.get("/:eventId", (req, res) => {

});

// Edit a specific event
router.post("/:eventId", (req, res) => {

});

// Delete a specific event
router.delete("/:eventId", (req, res) => {

});

// Create a member's attendance entry
router.post("/:eventId/attendance/member", (req, res) => {

});

// Create a guest's attendance entry
router.post("/:eventId/attendance/guests", (req, res) => {

});

// Edit a member's attendance entry
router.post("/:eventId/attendance/member/:memberId", (req, res) => {

});

// Edit a guest's attendance entry
router.post("/:eventId/attendance/guest/:guestId", (req, res) => {

});

module.exports = router;