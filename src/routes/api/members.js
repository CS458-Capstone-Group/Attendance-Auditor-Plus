/*
    module name:        /routes/api/members.js
    synopsis:           Contains route handlers for /api/members/*
    notable funtions:   all functions handle routes
*/
const express = require("express");
const Member = require("../../models/member.js");

const router = express.Router();

// Get a subset of users
router.get("/", (req, res) => {
    Member.find({}, (err, members) => {
        if (err) {
            res.status(500).json({ message: "unsuccessful in retrieving the members from the database" });
        }
        else {
            res.status(200).json(members);
        }
    });
});

// Create a member
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
        var member = new Member({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            phone: req.body.phone,
            department: req.body.department,
            category: req.body.category
        });

        member.save((err) => {
            if (err != null) {
                console.log(err.message);
                res.status(500).json({ message: "unsuccessful in creating the member" });
            }
            else {
                res.status(200).json({ message: "member successfully created" });
            }
        });
    }
});

// Get a specific user
router.get("/:memberId", (req, res) => {
    Member.findById(req.params.memberId, (err, member) => {
        if (err != null) {
            console.log(err.message);
            res.status(500).json({ message: "unsuccessful in retrieving the specified member" });
        }
        else {
            res.status(200).json(member);
        }
    });
});

// Edit a specific user
router.post("/:memberId", (req, res) => {
    var memberUpdate = {};

    if (req.body.fname && req.body.fname !== "") {
        memberUpdate.fname = req.body.fname;
    }
    if (req.body.lname && req.body.lname !== "") {
        memberUpdate.lname = req.body.lname;
    }
    if (req.body.email && req.body.email !== "") {
        memberUpdate.email = req.body.email;
    }
    if (req.body.phone && req.body.phone !== "") {
        memberUpdate.phone = req.body.phone;
    }
    if (req.body.department && req.body.department !== "")
    {
        memberUpdate.department = req.body.department;
    }
    if (req.body.category && req.body.category !== "")
    {
        memberUpdate.category = req.body.category;
    }

    Member.findByIdAndUpdate(req.params.memberId, memberUpdate, (err) => {
        if (err != null) {
            console.log(err.message);
            res.status(500).json({ message: "unable to update member" });
        }
        else {
            res.status(200).json({ message: "successfully updated member" });
        }
    });
});

// Delete a specific user
router.delete("/:memberId", (req, res) => {
    Member.findByIdAndDelete(req.params.memberId, (err) => {
        if (err != null) {
            console.log(err.message);
            res.status(500).json({ message: "unable to delete the member" });
        }
        else {
            res.status(200).json({ message: "successfully deleted the member" });
        }
    });
});

module.exports = router;