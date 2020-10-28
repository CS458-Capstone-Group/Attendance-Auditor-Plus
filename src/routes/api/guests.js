/*
    module name:        /routes/api/guests.js
    synopsis:           Contains route handlers for /api/guests/*
    notable funtions:   all functions handle routes
*/

const express = require("express");

const router = express.Router();

// Get a subset of guests
router.get("/", (req, res) => {

});

// Get a specific guest
router.get("/:guestId", (req, res) => {

});

// Edit a specific guest
router.post("/:guestId", (req, res) => {

});

// Delete a specific guest
router.delete("/:guestId", (req, res) => {

});

module.exports = router;