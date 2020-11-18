/*
    module name:        /routes/api/guests.js
    synopsis:           Contains route handlers for /api/guests/*
    notable funtions:   all functions handle routes
*/

const express = require("express");
const Guest = require("../../models/guest.js");

const router = express.Router();

// Get a subset of guests
router.get("/", (req, res) => {
    Guest.find({}, (err, events) => {
        if (err) {
            res.status(500).json({ message: "unsuccessful in retrieving the guests from the database" });
        }
        else {
            res.status(200).json(events);
        }
    });
});

// Create a guest
router.post("/", (req, res) => {

});

// Get a specific guest
router.get("/:guestId", (req, res) => {
    if (!req.body.fname || req.body.fname == "") {
        res.status(400).json({ message: "missing an fname property" });
    }
    else if (!req.body.lname || req.body.lname == "") {
        res.status(400).json({ message: "missing an lname property" });
    }
    else {
        var guest = new Event({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            phone: req.body.phone
        });

        guest.save((err) => {
            if (err != null) {
                console.log(err.message);
                res.status(500).json({ message: "unsuccessful in creating the guest" });
            }
            else {
                res.status(200).json({ message: "guest successfully created" });
            }
        });
    }
});

// Edit a specific guest
router.post("/:guestId", (req, res) => {
    var guestUpdate = {};

    if (req.body.fname && req.body.fname != "") {
        guestUpdate.fname = req.body.fname;
    }
    if (req.body.lname && req.body.lname != "") {
        guestUpdate.lname = req.body.lname;
    }
    if (req.body.email && req.body.email != "") {
        guestUpdate.email = req.body.email;
    }
    if (req.body.phone && req.body.phone != "") {
        guestUpdate.phone = req.body.phone;
    }

    Guest.findByIdAndUpdate(req.params.guestId, guestUpdate, (err, event) => {
        if (err != null) {
            console.log(err.message);
            res.status(500).json({ message: "unable to update guest" });
        }
        else {
            res.status(200).json({ message: "successfully updated guest" });
        }
    });
});

// Delete a specific guest
router.delete("/:guestId", (req, res) => {
    Guest.findByIdAndDelete(req.params.guestId, (err, event) => {
        if (err != null) {
            console.log(err.message);
            res.status(500).json({ message: "unable to delete the guest" });
        }
        else {
            res.status(200).json({ message: "successfully deleted the guest" });
        }
    });
});

module.exports = router;