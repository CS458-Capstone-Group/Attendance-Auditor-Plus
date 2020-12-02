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
            console.error(err.message);
            res.status(500).json({ message: "Failure - could not retreive events" });
        }
        else {
            // Filter events according to query arguments
            if (req.query.t)
            {
                events = events.filter((event) => {
                    return event.title.toLowerCase() === req.query.t.toLowerCase();
                });
            }
            if (req.query.l)
            {
                events = events.filter((event) => {
                    return event.location.toLowerCase() === req.query.l.toLowerCase();
                });
            }

            res.status(200).json(events);
        }
    });
});

// Create an event
//      Takes 6 parameters in body:
//          * title : string (required)
//          * description : string
//          * datetime : date (required, sent as a string "YYYY-MM-DDTHH:MM")
//          * capacity : integer
//          * location : string
//          * facilitators: [ string ]
router.post("/", (req, res) => {
    // Ensure title and datetime are not null
    if (!req.body.title || req.body.title.trim() === "") {
        res.status(400).json({ message: "Bad request - missing property title" });
    }
    else if (!req.body.datetime || req.body.datetime.trim() === "") {
        res.status(400).json({ message: "Bad request - missing property datetime" });
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
            if (err) {
                console.log(err.message);
                res.status(500).json({ message: "Failure - could not create event" });
            }
            else {
                res.status(200).json({ message: "Success - event created" });
            }
        });
    }
});

// Get a specific event
router.get("/:eventId", (req, res) => {
    Event.findById(req.params.eventId, (err, event) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: "Failure - could not retrieve event" });
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
//          * facilitators: [ string ]
router.post("/:eventId", (req, res) => {
    var eventUpdate = {}

    if (req.body.title && req.body.title.trim() !== "") {
        eventUpdate.title = req.body.title;
    }
    if (req.body.description && req.body.description.trim() !== "") {
        eventUpdate.description = req.body.description;
    }
    if (req.body.datetime && req.body.datetime.trim() !== "") {
        eventUpdate.datetime = req.body.datetime;
    }
    if (req.body.capacity && req.body.capacity > 0) {
        eventUpdate.capacity = req.body.capacity;
    }
    if (req.body.location && req.body.location.trim() !== "") {
        eventUpdate.location = req.body.location;
    }
    if (req.body.facilitators && req.body.facilitators.trim() !== "") {
        eventUpdate.facilitators = req.body.facilitators;
    }

    Event.findByIdAndUpdate(req.params.eventId, eventUpdate, (err) => {
        if (err) {
            console.log(err.message);
            res.status(500).json({ message: "Failure - could not update event" });
        }
        else {
            res.status(200).json({ message: "Success - event updated" });
        }
    });
});

// Delete a specific event
router.delete("/:eventId", (req, res) => {
    Event.findByIdAndDelete(req.params.eventId, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: "Failure - could not delete event" });
        }
        else {
            res.status(200).json({ message: "Success - event deleted" });
        }
    });
});

// Create an attendance entry
//      Expects a list of attendee objects, each attendee object having the following props:
//          userId: String //FOREIGN KEY,
//          didRSVP: Boolean,
//          didAttend: Boolean
router.post("/:eventId/attendance", (req, res) => {
    if (!req.body.attendees || req.body.attendees.trim() == "") {
        res.status(400).json({ message: "missing attendee(s)" });
    }

    console.log(JSON.stringify(req.body));

    for (let i = 0; i < req.body.attendees.length; i++) {
        if (!req.body.attendees[i].userId || req.body.attendees[i].userId === "") {
            res.status(400).json({ message: "Bad Request - missing property userId" });
        }
        else if (req.body.attendees[i].didRSVP === null || req.body.attendees[i].didRSVP === undefined) {
            res.status(400).json({ message: "missing didRSVP property" });
        }
        else if (req.body.attendees[i].didAttend === null ||req.body.attendees[i].didAttend === undefined) {
            res.status(400).json({ message: "missing didAttend property" });
        }
    }

    Event.findByIdAndUpdate(
        req.params.eventId,
        { $push: { attendees: req.body.attendees } },
        (err) => {
            if (err) {
                console.error(err.message);
                res.status(500).json({ message: "Failure - could not save attendance" });
            }
            else {
                res.status(200).json({ message: "Success - attendance saved" });
            }
        });
});

// Edit an attendance entry
//      Takes 2 optional parameters in body:
//          * didRSVP : boolean
//          * didAttend: boolean
router.post("/:eventId/attendance/:userId", (req, res) => {
    var eventObject = {
        _id: req.params.eventId,
        "attendees.userId": req.params.userId
    }

    var edit = { $set: {} };

    if (req.body.didRSVP !== null && req.body.didRSVP !== undefined) {
        edit.$set["attendees.$.didRSVP"] = req.body.didRSVP;
    }
    if (req.body.didAttend !== null && req.body.didAttend !== undefined) {
        edit.$set["attendees.$.didAttend"] = req.body.didAttend;
    }

    Event.findOneAndUpdate(eventObject, edit,
        (err) => {
            if (err) {
                console.error(err.message);
                res.status(500).json({ message: "Failure - could not update attendance entry" });
            }
            else {
                res.status(200).json({ message: "Success - attendance entry updated" });
            }
        });
});

module.exports = router;