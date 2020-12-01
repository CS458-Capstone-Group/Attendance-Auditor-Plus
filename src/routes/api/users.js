/*
    module name:        /routes/api/Users.js
    synopsis:           Contains route handlers for /api/Users/*
    notable funtions:   all functions handle routes
*/
const express = require("express");
const User = require("../../models/user.js");

const router = express.Router();

// Get a subset of users
router.get("/", (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: "unsuccessful in retrieving the Users from the database" });
        }
        else {
            res.status(200).json(users);
        }
    });
});

// Create a User
router.post("/", (req, res) => {
    if (!req.body.fname || req.body.fname === "") {
        res.status(400).json({ message: "missing an fname property" });
    }
    else if (!req.body.lname || req.body.lname === "") {
        res.status(400).json({ message: "missing an lname property" });
    }
    else if (!req.body.category || req.body.category === "") {
        res.status(400).json({message: "missing a category property"});
    }
    else {
        var user = new User({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            phone: req.body.phone,
            department: req.body.department,
            category: req.body.category
        });

        user.save((err) => {
            if (err) {
                console.error(err.message);
                res.status(500).json({ message: "unsuccessful in creating the User" });
            }
            else {
                res.status(200).json({ message: "User successfully created" });
            }
        });
    }
});

// Get a specific user
router.get("/:UserId", (req, res) => {
    User.findById(req.params.userId, (err, user) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: "unsuccessful in retrieving the specified User" });
        }
        else {
            res.status(200).json(user);
        }
    });
});

// Edit a specific user
router.post("/:userId", (req, res) => {
    var userUpdate = {};

    if (req.body.fname && req.body.fname !== "") {
        UserUpdate.fname = req.body.fname;
    }
    if (req.body.lname && req.body.lname !== "") {
        UserUpdate.lname = req.body.lname;
    }
    if (req.body.email && req.body.email !== "") {
        UserUpdate.email = req.body.email;
    }
    if (req.body.phone && req.body.phone !== "") {
        UserUpdate.phone = req.body.phone;
    }
    if (req.body.department && req.body.department !== "")
    {
        UserUpdate.department = req.body.department;
    }
    if (req.body.category && req.body.category !== "")
    {
        UserUpdate.category = req.body.category;
    }

    User.findByIdAndUpdate(req.params.userId, userUpdate, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: "unable to update User" });
        }
        else {
            res.status(200).json({ message: "successfully updated User" });
        }
    });
});

// Delete a specific user
router.delete("/:userId", (req, res) => {
    User.findByIdAndDelete(req.params.userId, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: "unable to delete the User" });
        }
        else {
            res.status(200).json({ message: "successfully deleted the User" });
        }
    });
});

module.exports = router;