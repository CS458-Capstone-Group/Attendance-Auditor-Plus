/*
    module name:        /routes/api/members.js
    synopsis:           Contains route handlers for /api/members/*
    notable funtions:   all functions handle routes
*/
const express = require("express");

const router = express.Router();

// Get a subset of users
router.get("/", (req, res) => {

});

// Get a specific user
router.get("/:memberId", (req, res) => {

});

// Edit a specific user
router.post("/:memberId", (req, res) => {

});

// Delete a specific user
router.delete("/:memberId", (req, res) => {

});

module.exports = router;