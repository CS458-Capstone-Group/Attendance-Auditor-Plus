/*
    module name:        /routes/api/inventory.js
    synopsis:           Contains route handlers for /api/inventory/*
    notable funtions:   all functions handle routes
*/
const express = require("express");
const InventoryItem = require("../../models/inventoryItem.js");
const CheckoutLog = require("../../models/checkoutLog.js");

const router = express.Router();

// Get a subset of inventory items
router.get("/", (req, res) => {
    InventoryItem.find({}, (err, inventoryItems) => {
        if (err) {
            res.status(500).json({ message: "unsuccessful in retrieving the inventory items from the database" });
        }
        else {
            res.status(200).json(inventoryItems);
        }
    });
});

// Create an inventory item
router.post("/", (req, res) => {
    if (!req.body.name || req.body.name === "") {
        res.status(400).json({ message: "missing an name property" });
    }
    else {
        var inventoryItem = new InventoryItem({
            name: req.body.name,
            description: req.body.description,
            sn: req.body.sn,
        });

        inventoryItem.save((err) => {
            if (err != null) {
                console.log(err.message);
                res.status(500).json({ message: "unsuccessful in creating the inventoryItem" });
            }
            else {
                res.status(200).json({ message: "inventory item successfully created" });
            }
        });
    }
});

// Get a specific inventory item
router.get("/:itemId", (req, res) => {
    InventoryItem.findById(req.params.itemId, (err, inventoryItem) => {
        if (err != null) {
            console.log(err.message);
            res.status(500).json({ message: "unsuccessful in retrieving the specified inventory item" });
        }
        else {
            res.status(200).json(inventoryItem);
        }
    });
});

// Edit a specific inventory item
router.post("/:itemId", (req, res) => {
    var itemUpdate = {};

    if (req.body.name && req.body.name !== "") {
        itemUpdate.name = req.body.name;
    }
    if (req.body.description && req.body.description != "") {
        itemUpdate.description = req.body.description;
    }
    if (req.body.sn && req.body.sn !== "") {
        itemUpdate.sn = req.body.sn;
    }

    InventoryItem.findByIdAndUpdate(req.params.itemId, itemUpdate, (err) => {
        if (err != null) {
            console.log(err.message);
            res.status(500).json({ message: "unable to update inventory item" });
        }
        else {
            res.status(200).json({ message: "successfully updated inventory item" });
        }
    });
});

// Delete a specific inventory item
router.delete("/:itemId", (req, res) => {
    InventoryItem.findByIdAndDelete(req.params.itemId, (err) => {
        if (err != null) {
            console.log(err.message);
            res.status(500).json({ message: "unable to delete the iventory item" });
        }
        else {
            res.status(200).json({ message: "successfully deleted the inventory item" });
        }
    });
});

// Checkout an inventory item
// Expects a memberId in the input
router.post("/:itemId/checkout", (req, res) => {
    CheckoutLog.find({ _id: req.params.itemId }, (err, checkoutLogs) => {
        if (err != null) {
            console.log(err.message);
            res.status(500).json({ message: "could not load the checkout log" })
        }
        else {
            if (checkoutLog == []) {
                var checkoutLog = new CheckoutLog(

                );
            }
        }
    });
});

// Checkin an inventory item
router.post("/:itemId/checkin", (req, res) => {
    CheckoutLog.find({ _id: req.params.itemId }, (err, checkoutLogs) => {
        if (err != null) {
            console.log(err.message);
            res.status(500).json({ message: "could not load the checkout log" });
        }
        else {

        }
    });
});

module.exports = router;