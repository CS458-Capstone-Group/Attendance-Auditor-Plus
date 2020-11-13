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
    Event.find({}, (err, docs) => {
        if (err) {
            res.status(400).send(err);
        }
        else {
            res.json(docs);
        }
    });
});

// Create an event
router.post("/", (req, res) => {
    if (!req.body.title || req.body.title == "") {
        res.status(400).json("Missing a title");
    }
    else if (!req.datetime || req.date == "") {
        res.status(400).json("Missing a datetime");
    }
    else {
        var event = new Event({
            title: req.body.title,
            description: req.body.description,
            datetime: req.body.datetime,
            capacity: req.body.capacity,
            location: req.body.location,
            facilitators: req.body.facilitators
        });

        event.save((err) => {
            if (err != null) {
                res.json(err);
            }
            else {
                res.status(201);
            }
        });
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