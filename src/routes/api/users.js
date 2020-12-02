/*
    module name:        /routes/api/Users.js
    synopsis:           Contains route handlers for /api/Users/*
    notable funtions:   all functions handle routes
*/
const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../../auth.js");
const User = require("../../models/user.js");

const router = express.Router();

// Authenticate user
// Expects 2 properties:
//      - email (required)
//      - password (required)
router.post("/auth", (req, res) => {
    if (!req.body.email || req.body.email.trim() === "") {
        res.status(400).json({message: "Bad Request - missing property email"});
    }
    else if (!req.body.password || req.body.password.trim() === "") {
        res.status(400).json({message: "Bad Request - missing property password"});
    }
    else {
        User.findOne({email: req.body.email}, (err, user) => {
            if (err) {
                console.error(err.message);
                res.status(500).json({message: "Failure - unable to authenticate user"});
            }
            else if (!user) {
                res.status(500).json({message: "Failure - unable to authenticate user"})
            }
            else {
                bcrypt.compare(req.body.password, user.password,
                    (err, same) => {
                        if (err) {
                            console.error(err.message);
                            res.status(500).json({message: "Failure - unable to authenticate user"});
                        }
                        else if (!same)
                        {
                            res.status(400).json({message: "Bad Request - credentials do not match"});
                        }
                        else {
                            auth.seshes[req.cookies.session] = user._id;
                            res.status(200).json({message: "Success"});
                        }
                    });
            }
        });
    }
});

// Create a User
// Expects 7 properties in the body
//      fname: string (required)
//      lname: string (required)
//      email: string
//      phone: string
//      department: string
//      category: string (required)
//      password: string (required)
router.post("/", auth.authOrganizer, (req, res) => {
    if (!req.body.fname || req.body.fname.trim() === "") {
        res.status(400).json({ message: "Bad Request - missing property fname" });
    }
    else if (!req.body.lname || req.body.lname.trim() === "") {
        res.status(400).json({ message: "Bad Request - missing property lname" });
    }
    else if (!req.body.email || req.body.email.trim() === "") {
        res.status(400).json({message: "Bad Request - missing property email"})
    }
    else if (!req.body.category || req.body.category.trim() === "") {
        res.status(400).json({message: "Bad Request - missing peroperty category"});
    }
    else if (!req.body.password || req.body.password.trim() === "") {
        res.status(400).json({message: "Bad Request - missing property password"})
    }
    else {
        User.find({}, (err, users) => {
            if (err) {
                console.error(err.message);
                res.status(500).json({message: "Failure - could not create user"});
            }
            else {
                let uniqueEmail = true;

                for (let i = 0; i < users.length; i++) {
                    if (users[i].email === req.body.email) {
                        uniqueEmail = false;
                    }
                }

                if (!uniqueEmail) {
                    res.status(400).json({message: "Bad Request - email already in use"});
                }
                else {
                    var user = new User({
                        fname: req.body.fname,
                        lname: req.body.lname,
                        email: req.body.email,
                        phone: req.body.phone,
                        department: req.body.department,
                        category: req.body.category3d4f
                    });
        
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (err) {
                            console.error(err.message);
                            res.status(500).json({message: "Failure - could not create user"});
                        }
                        else {
                            user.password = hash;
        
                            user.save((err) => {
                                if (err) {
                                    console.error(err.message);
                                    res.status(500).json({ message: "Failure - could not create user" });
                                }
                                else {
                                    res.status(200).json({ message: "Success - user created" });
                                }
                            });
                        }
                    });
                }
            }
        });
    }
});

// Get a specific user
router.get("/:userId", (req, res) => {
    User.findById(req.params.userId, (err, user) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: "Failure - could not get user" });
        }
        else if (!user)
        {
            res.status(500).json({message: "Failure - could not get user"});
        }
        else {
            delete user.password;
            res.status(200).json(user);
        }
    });
});

// Edit a specific user
// Expects 6 properties in the body
//      fname: string
//      lname: string
//      email: string
//      phone: string
//      department: string
//      category: string
router.post("/:userId", auth.authOrganizer, (req, res) => {
    var userUpdate = {};

    if (req.body.fname && req.body.fname.trim() !== "") {
        userUpdate.fname = req.body.fname;
    }
    if (req.body.lname && req.body.lname.trim() !== "") {
        userUpdate.lname = req.body.lname;
    }
    if (req.body.email && req.body.email.trim() !== "") {
        userUpdate.email = req.body.email;
    }
    if (req.body.phone && req.body.phone.trim() !== "") {
        userUpdate.phone = req.body.phone;
    }
    if (req.body.department && req.body.department.trim() !== "")
    {
        userUpdate.department = req.body.department;
    }
    if (req.body.category && req.body.category.trim() !== "")
    {
        userUpdate.category = req.body.category;
    }

    User.findByIdAndUpdate(req.params.userId, userUpdate, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: "Failure - could not update user" });
        }
        else {
            res.status(200).json({ message: "Success - user updated" });
        }
    });
});

// Delete a specific user
router.delete("/:userId", auth.authOrganizer, (req, res) => {
    User.findByIdAndDelete(req.params.userId, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: "Failure - could not delete user" });
        }
        else {
            res.status(200).json({ message: "Success - user deleted" });
        }
    });
});

module.exports = router;