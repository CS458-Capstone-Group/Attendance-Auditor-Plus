/*
    module name:        /routes/api/events.js
    synopsis:           Contains route handlers for /api/events/*
    notable funtions:   all functions handle routes
*/
const express = require("express");
const Event = require("../../models/event.js");

const router = express.Router();

// Get a subset of events in chronological order
router.get("/", (req, res) => {
    Event.find({}).sort("datetime").exec((err, events) => {
        if (err) {
            res.status(500).json({ message: "unsuccessful in retrieving the events from the database" });
        }
        else {
            res.status(200).json(events);
        }
    });
});

// Create an event
router.post("/", (req, res) => {
    if (!req.body.title || req.body.title.trim() === "") {
        res.status(400).json({ message: "missing a title property" });
    }
    else if (!req.body.datetime || req.body.datetime.trim === "") {
        res.status(400).json({ message: "missing a datetime property" });
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
                console.log(err.message);
                res.status(500).json({ message: "unsuccessful in creating the event" });
            }
            else {
                res.status(200).json({ message: "event successfully created" });
            }
        });
    }
});

// Get a specific event
router.get("/:eventId", (req, res) => {
    Event.findById(req.params.eventId, (err, event) => {
        if (err != null) {
            console.log(err.message);
            res.status(500).json({ message: "unsuccessful in retrieving the event" });
        }
        else {
            res.status(200).json(event);
        }
    })
});

// Edit a specific event
//      Takes 6 optional parameters in body:
//          * title : string
//          * description : string
//          * datetime : date (sent as a string "YYYY-MM-DDTHH:MM")
//          * capacity : integer
//          * location : string
//          * facilitators: [{ isMember : string, id : string }]
router.post("/:eventId", (req, res) => {
    var eventUpdate = {}

    if (req.body.title && req.body.title !== "") {
        eventUpdate.title = req.body.title;
    }
    if (req.body.description && req.body.description !== "") {
        eventUpdate.description = req.body.description;
    }
    if (req.body.datetime && req.body.datetime !== "") {
        eventUpdate.datetime = req.body.datetime;
    }
    if (req.body.capacity && req.body.capacity !== "") {
        eventUpdate.capacity = req.body.capacity;
    }
    if (req.body.location && req.body.location !== "") {
        eventUpdate.location = req.body.location;
    }
    if (req.body.facilitators && req.body.facilitators !== "") {
        eventUpdate.facilitators = req.body.facilitators;
    }

    Event.findByIdAndUpdate(req.params.eventId, eventUpdate, (err) => {
        if (err != null) {
            console.log(err.message);
            res.status(500).json({ message: "unable to update event" });
        }
        else {
            res.status(200).json({ message: "successfully updated event" });
        }
    });
});

// Delete a specific event
router.delete("/:eventId", (req, res) => {
    Event.findByIdAndDelete(req.params.eventId, (err) => {
        if (err != null) {
            console.log(err.message);
            res.status(500).json({ message: "unable to delete the event" });
        }
        else {
            res.status(200).json({ message: "successfully deleted the event" });
        }
    });
});

// Create an attendance entry
//      Expects a list of attendee objects
router.post("/:eventId/attendance", (req, res) => {
    if (!req.body.attendees || req.body.attendees == "") {
        res.status(400).json({ message: "missing attendee(s)" });
    }

    console.log(JSON.stringify(req.body));

    for (let i = 0; i < req.body.attendees.length; i++) {
        if (req.body.attendees[i].isMember === null || req.body.attendees[i].isMember === "") {
            res.status(400).json({ message: "missing isMember property" });
        }
        else if (!req.body.attendees[i].id || req.body.attendees[i].id == "") {
            res.status(400).json({ message: "missing id property" });
        }
        else if (req.body.attendees[i].didRSVP === null || req.body.attendees[i].didRSVP === "") {
            res.status(400).json({ message: "missing didRSVP property" });
        }
        else if (req.body.attendees[i].didAttend === null || req.body.attendees[i].didAttend === "") {
            res.status(400).json({ message: "missing didAttend property" });
        }
    }

    Event.findByIdAndUpdate(
        req.params.eventId,
        { $push: { attendees: req.body.attendees } },
        (err, event) => {
            if (err != null) {
                console.log(err.message);
                res.status(500).json({ message: "unsuccessful in saving the attendees to the database" });
            }
            else {
                res.status(200).json({ message: "successfully added attendees" });
            }
        });
});

// Edit an attendance entry
//      Takes 2 optional parameters in body:
//          * didRSVP : boolean
//          * didAttend: boolean
router.post("/:eventId/attendance/:memberId", (req, res) => {
    var eventObject = {
        _id: req.params.eventId,
        "attendees.id": req.params.memberId
    }

    var edit = { $set: {} };

    if (req.body.didRSVP !== null && req.body.didRSVP !== "") {
        edit.$set["attendees.$.didRSVP"] = req.body.didRSVP;
    }
    if (req.body.didAttend !== null && req.body.didAttend !== "") {
        edit.$set["attendees.$.didAttend"] = req.body.didAttend;
    }

    Event.findOneAndUpdate(eventObject, edit,
        (err, event) => {
            if (err != null) {
                console.log(err.message);
                res.status(500).json({ message: "unsuccessful in updating the attendee(s)" });
            }
            else {
                res.status(200).json({ message: "successfully modified the attendee" });
            }
        });
});

module.exports = router;