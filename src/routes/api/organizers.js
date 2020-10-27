/*
    module name:        /routes/api/organizers.js
    synopsis:           Contains route handlers for /api/organizers/*
    notable funtions:   all functions handle routes
*/
const express = require("express");

const router = express.Router();

// Get a subset of organizers
router.get("/", (req, res) => {

});

// Get a specific organizer
router.get("/:organizerId", (req, res) => {

});

// Edit a specific organizer
router.post("/:organizerId", (req, res) => {

});

// Delete a specific organizer
router.delete("/:organizerId", (req, res) => {

});

module.exports = router;