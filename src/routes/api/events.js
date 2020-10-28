/*
    module name:        /routes/api/events.js
    synopsis:           Contains route handlers for /api/events/*
    notable funtions:   all functions handle routes
*/

const express = require("express");

const router = express.Router();

// Get a subset of events
router.get("/", (req, res) => {

});

// Create an event
router.post("/", (req, res) => {

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