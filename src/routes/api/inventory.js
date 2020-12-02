/*
    module name:        /routes/api/inventory.js
    synopsis:           Contains route handlers for /api/inventory/*
    notable funtions:   all functions handle routes
*/
const express = require("express");

const InventoryItem = require("../../models/inventoryItem.js");

const router = express.Router();

// Get a subset of inventory items
router.get("/", (req, res) => {
    InventoryItem.find({}, (err, inventoryItems) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: "Failure - could not get inventory items" });
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
    if(!req.body.name || req.body.name.trim() === ""){
        res.status(400).json({message: "Bad Request - missing property name"});
    }
    else {
        var inventoryItem = new InventoryItem({
            name: req.body.name,
            description: req.body.description,
            sn: req.body.sn,
            checkedOut: false,
            checkedOutBy: null
        });

        inventoryItem.save((err) => {
            if (err) {
                console.error(err.message);
                res.status(500).json({ message: "Failure - could not create inventory item"});
            }
            else {
                res.status(200).json({ message: "Success - item added to inventory"});
            }
        });
    } 
});

// Get a specific inventory item
router.get("/:itemId", (req, res) => {
    InventoryItem.findById(req.params.itemId, (err, inventoryItem) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: "Failure - could not get inventory item" });
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
  
    if (req.body.name && req.body.name.trim() !== "") {
        itemUpdate.name = req.body.name;
    }
    if (req.body.description && req.body.description.trim() != "") {
        itemUpdate.description = req.body.description;
    }
    if (req.body.sn && req.body.sn.trim() !== "") {
        itemUpdate.sn = req.body.sn;
    }

    InventoryItem.findByIdAndUpdate(req.params.itemId, itemUpdate, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: "Failure - could not update inventory item" });
        }
        else {
            res.status(200).json({ message: "Success - inventory item updated" });
        }
    });
});

// Delete a specific inventory item
router.delete("/:itemId", (req, res) => {
    InventoryItem.findByIdAndDelete(req.params.itemId, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: "Failure - unable to delete inventory item" });
        }
        else {
            res.status(200).json({ message: "Success - inventory item updated" });
        }
    });
});
  
    // Expects 1 property in the body:
    //   itemID: String
router.post("/:itemId/checkout", (req, res) => {
    if(!req.body.userId || req.body.userId.trim() === ""){
        res.status(400).json({message: "Bad Request - missing property userId"});
    }
    else{
        InventoryItem.findById(req.params.itemId,
        (err, inventoryItem) =>
        {
            if (err) {
                console.error(err.message);
                res.status(500).json({message: "Failure - unable to retrieve inventory item"});
            }
            else if (inventoryItem.checkedOut) {
                res.status(400).json({message: "Bad Request - item already checked out"});
            }
            else {
                InventoryItem.findByIdAndUpdate(req.body.itemId, {checkedOut: true, checkedOutBy: req.body.userId},
                    (err) => {
                        if (err) {
                            console.error(err.message);
                            res.status(500).json({message: "Failure - could not check out item"});
                        }
                        else
                        {
                            res.status(200).json({message: "Success - item checked out"});
                        }
                    });
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
    InventoryItem.findById(req.params.itemId, (err, inventoryItem) => {
        if (err) {
            console.log(err.message);
            res.status(500).json({ message: "Failure - could not retrieve item" });
        }
        else if (!inventoryItem.checkedOut)
        {
            res.status(400).json({message: "Bad Request - inventory item is not checked out"});
        }
        else {
            InventoryItem.findByIdAndUpdate(req.params.itemId, {checkedOut: false, checkedOutBy: null},
                (err) => {
                    if (err) {
                        console.error(err.message);
                        res.status(500).json({message: "Failure - could not check in inventory item"});
                    }
                    else {
                        res.status(200).json({message: "Success - inventory item checked in"});
                    }
                });
        }
    });
});

module.exports = router;