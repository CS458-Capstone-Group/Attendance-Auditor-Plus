/*
    module name:        /routes/api/organizers.js
    synopsis:           Contains route handlers for /api/organizers/*
    notable funtions:   all functions handle routes
*/
const express = require("express");
const Organizer = require("../../models/organizer.js");

const router = express.Router();

// Get a subset of organizers
router.get("/", (req, res) => {
    Organizer.find({}, (err, organizers) => {
        if (err) {
            res.status(500).json({ message: "unsuccessful in retrieving the organizers from the database" });
        }
        else {
            res.status(200).json(organizers);
        }
    });
});

// Promote a member to an organizer
router.post("/", (req, res) => {
    if (!req.body.memberId || req.body.memberId === "") {
        res.status(400).json({ message: "missing a memberId property" });
    }
    else {
        var organizer = new Organizer({
            memberId: req.body.memberId,
            isAdmin: req.body.idAdmin
        });

        organizer.save((err) => {
            if (err != null) {
                console.log(err.message);
                res.status(500).json({ message: "unsuccessful in creating the organizer" });
            }
            else {
                res.status(200).json({ message: "organizer successfully created" });
            }
        });
    }
});

// Get a specific organizer
router.get("/:organizerId", (req, res) => {
    Organizer.findById(req.params.organizerId, (err, organizer) => {
        if (err != null) {
            console.log(err.message);
            res.status(500).json({ message: "unsuccessful in retrieving the specified organizer" });
        }
        else {
            res.status(200).json(organizer);
        }
    });
});

// Edit a specific organizer
router.post("/:organizerId", (req, res) => {
    var organizerUpdate = {};

    if (req.body.isAdmin && req.body.isAdmin !== "") {
        organizerUpdate.isAdmin = req.body.isAdmin;
    }

    Organizer.findByIdAndUpdate(req.params.organizerId, organizerUpdate, (err) => {
        if (err != null) {
            console.log(err.message);
            res.status(500).json({ message: "unable to update organizer" });
        }
        else {
            res.status(200).json({ message: "successfully updated organizer" });
        }
    });
});

// Delete a specific organizer
router.delete("/:organizerId", (req, res) => {
    Organizer.findByIdAndDelete(req.params.organizerId, (err) => {
        if (err != null) {
            console.log(err.message);
            res.status(500).json({ message: "unable to delete the organizer" });
        }
        else {
            res.status(200).json({ message: "successfully deleted the organizer" });
        }
    });
});

module.exports = router;