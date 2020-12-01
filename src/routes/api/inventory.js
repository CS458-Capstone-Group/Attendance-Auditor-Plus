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
  
// Create a new inventory item
    // name: String, //NOT NULL
    // description: String, 
    // sn: String
router.post("/", (req, res) => {
    if(req.body.name == ""){
        res.status(400).json({message: "missing item name"});
    }
    else {
        var inventoryItem = new InventoryItem({
            name: req.body.name,
            description: req.body.description,
            sn: req.body.sn
        });

        inventoryItem.save((err) => {
            if (err != null) {
                console.log(err.message);
                res.status(500).json({ message: "unsuccessful in adding a new inventory item"});
            }
            else {
                res.status(200).json({ message: "items successfully added to inventory"});
            }
        });
    } 
});

// Get a specific inventory item
router.get("/:itemId", (req, res) => {
    InventoryItem.findById(req.params.itemId, (err, inventoryItem) => {
        if (err !== null) {
            console.log(err.message);
            res.status(500).json({ message: "unsuccessful in retrieving the specified inventory item" });
        }
        else {
            res.status(200).json(inventoryItem);
        }
    });
});

// Edit a specific inventory item
    // name: String, //NOT NULL
    // description: String, 
    // sn: String
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
        if (err !== null) {
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
        if (err !== null) {
            console.log(err.message);
            res.status(500).json({ message: "unable to delete the iventory item" });
        }
        else {
            res.status(200).json({ message: "successfully deleted the inventory item" });
        }
    });
});
  
    // itemID: String, //FOREIGN KEY
    // memberID: String, //FOREIGN KEY
    // checkoutDate: Date, //NOT NULL
    // checkoutReturnDate: Date 
router.post("/:itemId/checkout", (req, res) => {
    if(req.body.itemID == ""){
        res.status(400).json({message: " missing itemID "});
    }
    if(req.body.memberID == ""){
        res.status(400).json({message: " missing memberID "});
    }
    if(req.body.checkoutDate == ""){
        res.status(400).json({message: " missing checkout date "});
    }
    if(req.body.checkoutReturnDate != ""){
        res.status(400).json({message: " return date should be blank "});
    }
    else{
        var checkoutLog = new checkoutLog({
            itemID: req.body.itemId,
            memberID: req.body.memberID,
            checkoutDate: req.body.checkoutDate,
            checkoutReturnDate: null
        });

        checkoutLog.save((err) => {
            if (err != null) {
                console.log(err.message);
                res.status(500).json({ message: "unsuccessful in checking out item"});
            }
            else {
                res.status(200).json({ message: "items successfully checked out"});
            }
        });
    }
});

// Checkin an inventory item
    // itemID: String, //FOREIGN KEY
    // memberID: String, //FOREIGN KEY
    // checkoutDate: Date, //NOT NULL
    // checkoutReturnDate: Date 
router.post("/:itemId/checkin", (req, res) => {
    CheckoutLog.find({ _id: req.params.itemId }, (err, checkoutLogs) => {
        if (err !== null) {
            console.log(err.message);
            res.status(500).json({ message: "could not load the checkout log" });
        }
        else {

        }
    });
});

module.exports = router;