/*
    module name:        /routes/api/inventory.js
    synopsis:           Contains route handlers for /api/inventory/*
    notable funtions:   all functions handle routes
*/
const express = require("express");

const router = express.Router();

// Get a subset of inventory items
router.get("/", (req, res) => {

});

// Get a specific inventory item
router.get("/:itemId", (req, res) => {

});

// Edit a specific inventory item
router.post("/:itemId", (req, res) => {

});

// Delete a specific inventory item
router.delete("/:itemId", (req, res) => {

});

// Checkout an inventory item
router.post("/:itemId/checkout", (req, res) => {

});

// Checkin an inventory item
router.post("/:itemId/checkin", (req, res) => {

});

module.exports = router;