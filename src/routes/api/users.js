/*
    module name:        /routes/api/users.js
    synopsis:           Contains route handlers for /api/users/*
    notable funtions:   all functions handle routes
*/
const express = require("express");

const router = express.Router();

// Get a subset of users
router.get("/", (req, res) => {

});

// Get a specific user
router.get("/:userId", (req, res) => {

});

// Edit a specific user
router.post("/:userId", (req, res) => {

});

// Delete a specific user
router.delete("/:userId", (req, res) => {

});

module.exports = router;