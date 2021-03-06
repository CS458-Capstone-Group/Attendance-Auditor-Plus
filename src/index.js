/*
    module name:            index.js
    synopsis:               main entry point for the server. Brings
                            together routes and models to serve
                            clients webpages with correct info and
                            handle client requests to modify data.
    important functions:    app.use() adds functionality to the server
*/


const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const auth = require("./auth.js");

const Event = require("./models/event.js");
const InventoryItem = require("./models/inventoryItem.js");
const User = require("./models/user.js");
const user = require("./models/user.js");

const app = express();
const port = process.env.PORT || 5000;

// IF FLAG IS 1 THEN SET STRING TO EMPTY
// ELSE SET FLAG TO 1 WHEN MESSAGE IS SET
var FLASHMESSAGE = ""
var FLASHRESETFLAG = 0;

mongoose.connect(
  "mongodb+srv://readwrite:humboldt!1@cluster0.0sjmg.mongodb.net/attendanceauditor?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
);

const db = mongoose.connection;
db.on("error", () => console.error("connection error"));
db.once("open", () => {
  app.set("views", __dirname + "/views");
  app.set("view-engine", "ejs");
  app.use(express.urlencoded({ extended: false })); // we wanna be able to access varaibles inside our posts reqs
  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.json());
  app.use(cookieParser());
  app.use((req, res, next) => {
    if (!req.cookies.session) {
      var r = Math.random().toString();
      res.cookie("session", r.substring(2));
    }

    next();
  });
  

  app.get("/", (req, res) => {
    res.redirect("/events");
  });

  app.post("/events/:eventId/attendance", (req, res) => {
    Event.findById(req.params.eventId, (err, event) => {
      if (err) console.error(err);

      var didRSVP = true;

      attendees = [];

      for (const id in req.body) {
        if (id === "addAttendeeText") {
          didRSVP = false;
        }
        else {
          attendees.push({ userId: id, didRSVP: didRSVP, didAttend: req.body[id] });
        }
      }

      for (var i = 0; i < event.attendees.length; i++) {
        var isIncluded = false;

        for (var j = 0; j < attendees.length; j++) {
          if (event.attendees[i].userId === attendees[j].userId) {
            isIncluded = true;
          }
        }

        if (!isIncluded) {
          attendees.push({
            userId: event.attendees[i].userId,
            didRSVP: event.attendees[i].didRSVP,
            didAttend: false
          });
        }
      }

      Event.findByIdAndUpdate(req.params.eventId, { attendees: attendees }, (err) => {
        if (err) console.log(err);

        res.redirect("/events/" + req.params.eventId);
      });
    });
  });

  app.get("/events/create", (req, res) => {
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
        res.redirect("/events");
      }
      else {
        res.render("./events/eventCreateFormOrg.ejs");
      }
    });
  });

  app.post("/events", (req, res) => {
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      //flash message
      FLASHMESSAGE = 'Event Created!';
      FLASHRESETFLAG = 0;
      //flash message

      if (err) {
        console.log(err.message);
        FLASHMESSAGE = 'MongoDb failed to fetch Users';

      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
        FLASHMESSAGE = 'Unauthorized Access, logged out?';
        res.redirect("/events");
      }
      else {
        if (!req.body.title || req.body.title.trim() === "") {
          res.json({ message: "missing title" });
        }
        else if (!req.body.date || req.body.date.trim() === "") {
          res.json({ message: "missing date" });
        }
        else if (!req.body.time || req.body.time.trim() === "") {
          res.json({ message: "missing time" });
        }



        var event = new Event({
          title: req.body.title,
          description: req.body.description,
          date: req.body.date,
          time: req.body.time + req.body.timemins + ' ' + req.body.timeampm,
          capacity: req.body.capacity,
          location: req.body.location
        });



        event.save((err) => {
          if (err) {
            console.error(err);
            FLASHMESSAGE = 'Event failed to be Created!';
            res.json({ message: "could not save event" });
          }
          else {
            res.redirect("/events");
          }
        });
      }
    });
  });

  app.get("/events", (req, res) => {
    if (FLASHRESETFLAG == 1) {
      FLASHMESSAGE = ""
      FLASHRESETFLAG = 0;
    }

    var now = new Date();
    var today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getDate()));

    Event.find({ date: { $gte: today } }).sort("date").sort("time").exec((err, events) => {
      if (err) {
        console.log(err.message);
        FLASHMESSAGE = 'MongoDb Event query fail!';
      }

      User.findById(auth.sessions[req.cookies.session], (err, user) => {
        if (err) {
          console.log(err.message);
          FLASHMESSAGE = 'MongoDb User query fail!';
        }
        else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
          FLASHRESETFLAG = 1;
          res.render("./events/events.ejs", { events: events, FLASHMESSAGE: FLASHMESSAGE });
        }
        else {
          FLASHRESETFLAG = 1;
          res.render("./events/eventsOrg.ejs", { events: events, FLASHMESSAGE: FLASHMESSAGE });
        }
      });
    });
  });

  app.get("/events/:eventId", (req, res) => {
    Event.findById(req.params.eventId, (err, event) => {
      if (err) {
        console.log(err.message);
      }
      User.findById(auth.sessions[req.cookies.session], (err, user) => {
        if (err) {
          console.log(err.message);
        }
        else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
          res.render("./events/eventDetails.ejs", { event: event });
        }
        else {
          res.render("./events/eventDetailsOrg.ejs", { event: event });
        }

      });
    });
  });

  app.post("/events/:eventId", (req, res) => {
    //flash message update
    FLASHRESETFLAG = 0;
    FLASHMESSAGE = 'Event Updated!';
    //flash message
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
        FLASHMESSAGE = 'MongoDb failed to fetch Users';
      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
        FLASHMESSAGE = 'Unauthorized Access, logged out?';
        res.redirect("/events");
      }
      else {
        Event.findByIdAndUpdate(req.params.eventId,
          {
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            time: req.body.time + ":" + req.body.timemins + " " + req.body.timeampm,
            capacity: req.body.capacity,
            location: req.body.location
          },
          (err) => {
            if (err) {
              console.error(err);
              FLASHMESSAGE = 'Event failed to be Updated!';
            }

            res.redirect("/events");
          });

      }
    });
  });

  app.post("/events/:eventId/delete", (req, res) => {
    //flash message
    FLASHMESSAGE = 'Event Deleted!';
    FLASHRESETFLAG = 0;
    //flash message
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
        FLASHMESSAGE = 'MongoDb failed to fetch Users';
      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
        FLASHMESSAGE = 'Unauthorized Access, logged out?';
        res.redirect("/events");
      }
      else {
        Event.findByIdAndDelete(req.params.eventId, (err) => {
          if (err) {
            console.error(err.message);
            FLASHMESSAGE = 'Event failed to be Deleted!';
          }

          res.redirect("/events");
        });
      }
    });
  });

  app.get("/events/:eventId/edit", (req, res) => {
    Event.findById(req.params.eventId, (err, event) => {
      if (err) {
        console.error(err);
      }

      res.render("./events/eventEditFormOrg.ejs", { event: event });
    });
  });

  app.post("/events/:eventId/rsvp", (req, res) => {
    if (!auth.sessions[req.cookies.session]) {
      res.redirect("/login");
    }
    else {
      //flash message
      FLASHMESSAGE = 'RSVP Sent!';
      FLASHRESETFLAG = 0;
      //flash message
      var userId = auth.sessions[req.cookies.session];

      Event.findById(req.params.eventId, (err, event) => {
        if (err) console.error(err);
        if (err) FLASHMESSAGE = 'MongoDb failed to fetch Users';

        let alreadyThere = false;

        for (let i = 0; i < event.attendees.length; i++) {
          if (event.attendees[i].userId == userId) {
            alreadyThere = true;

            if (event.attendees[i].didRSVP === false) {
              event.attendees[i].didRSVP = true;
            }
            else { break; }
          }
        }

        if (alreadyThere) {
          Event.findByIdAndUpdate(req.params.eventId, { attendees: event.attendees }, (err) => {
            if (err) console.error(err);
            if (err) FLASHMESSAGE = 'Failed to RSVP!';
          });
        }
        else {
          Event.findByIdAndUpdate(req.params.eventId,
            {
              $push:
              {
                attendees:
                {
                  userId: userId,
                  didRSVP: true,
                  didAttend: false
                }
              }
            }, (err) => {
              if (err) console.error(err);
              if (err) FLASHMESSAGE = 'Failed to RSVP!';
            });
        }


        res.redirect("/events");
      });
    }
  });

  app.get("/events/:eventId/attendance", (req, res) => {
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
        res.redirect("/events");
      }
      else {
        Event.findById(req.params.eventId, async function (err, event) {
          if (err) console.error(err);

          User.find({}, (err, users) => {
            if (err) console.error(err);

            let actualUsersForReal = [];

            users.forEach(user => {
              event.attendees.forEach(attendee => {
                if (user._id == attendee.userId) {
                  actualUsersForReal.push({ email: user.email, attendInfo: attendee });
                }
              });
            });

            res.render("events/eventAttendance.ejs", { attendance: actualUsersForReal, eventId: req.params.eventId, eventTitle: event.title });
          });
        });
      }
    });
  });

  app.get("/attendees/:email", (req, res) => {
    User.findOne({ email: req.params.email }, (err, user) => {
      if (err) {
        console.error(err.message);
      }

      if (!user) {
        res.json({ isValidEmail: false });
      }
      else {
        res.json({ isValidEmail: true, id: user._id });
      }
    });
  });




// INVENTORY

  app.get("/inventory/create", (req, res) => {
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
        res.redirect("/inventory");
      }
      else {
        res.render("./inventory/inventoryItemCreateFormOrg.ejs");
      }
    });
  })

  app.post("/inventory", (req, res) => {
    //flash message
    FLASHMESSAGE = 'Item added Successfully!';
    FLASHRESETFLAG = 0;
    //flash message
    User.findById(auth.sessions[req.cookies.session], (err, user) => {


      if (err) {
        console.log(err.message);
        FLASHMESSAGE = 'MongoDb failed to fetch Users';
      }
      else {
        /*
        if (!user || (user.category !== "organizer" && user.category !== "admin")) {
          res.redirect("/inventory");
        }
        if (!req.body.name || req.body.name.trim() === "") {
          res.json({ message: "missing name" });
        }
        else if (!req.body.description || req.body.description.trim() === "") {
          res.json({ message: "missing description" });
        }
        else if (!req.body.sn || req.body.sn.trim() === "") {
          res.json({ message: "missing sn" });
        }
        else if (!req.body.checkedOut || req.body.checkedOut.trim() === "") {
          res.json({ message: "missing checkedOut" });
        }
        else if (!req.body.checkedOutBy || req.body.CheckedOutBy.trim() === "") {
          res.json({ message: "missing checkedOutBy" });
        }
          */


        var inventoryItem = new InventoryItem({
          name: req.body.name,
          description: req.body.description,
          sn: req.body.sn,
          checkedOut: "false",
          checkedOutBy: ""
        });




        inventoryItem.save((err) => {
          if (err) {
            console.error(err);
            res.json({ message: "could not save item" });
            FLASHMESSAGE = 'Failed to create Item!';
          }
          else {

            res.redirect("/inventory");
          }
        });
      }
    });
  });

  app.get("/inventory", (req, res) => {
    if (FLASHRESETFLAG == 1) {
      FLASHMESSAGE = ""
      FLASHRESETFLAG = 0;
    }

    InventoryItem.find({}, (err, inventory) => {
      if (err) {
        console.log(err.message);
        FLASHMESSAGE = 'MongoDb fetch inventory error!';
      }
      User.findById(auth.sessions[req.cookies.session], (err, user) => {
        if (err) {
          console.log(err.message);
          FLASHMESSAGE = 'MongoDb fetch user error!';
        }
        else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
          FLASHRESETFLAG = 1;
          res.render("./inventory/inventory.ejs", { inventory: inventory, FLASHMESSAGE: FLASHMESSAGE });
        }
        else {
          FLASHRESETFLAG = 1;
          res.render("./inventory/inventoryOrg.ejs", { inventory: inventory, FLASHMESSAGE: FLASHMESSAGE });
        }

      });


    });
  });

  app.get("/inventory/search/", (req, res) => {
      // dev mode add regex
   // InventoryItem.find({ name: req.query.invName }, (err, inventory) => {

   var sWord = req.query.invName.toString()
    InventoryItem.find({ name: { $regex: sWord, $options:"mi"} }, (err, inventory) => {
      if (err) {
        console.log(err.message);
      }
      User.findById(auth.sessions[req.cookies.session], (err, user) => {
        if (err) {
          console.log(err.message);
        }
        else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
          res.render("./inventory/inventoryItemSearchDetails.ejs", { inventory: inventory, keyword: req.query.invName });
        }
        else {
          res.render("./inventory/inventoryItemSearchDetailsOrg.ejs", { inventory: inventory, keyword: req.query.invName });
        }

      });
    });
  });

  app.get("/inventory/:inventoryId", (req, res) => {
    InventoryItem.findById(req.params.inventoryId, (err, item) => {
      if (err) {
        console.log(err.message);
      }
      User.findById(auth.sessions[req.cookies.session], (err, user) => {
        if (err) {
          console.log(err.message);
        }
        else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
          res.render("./inventory/inventoryItemDetails.ejs", { item: item });
        }
        else {
          res.render("./inventory/inventoryItemDetailsOrg.ejs", { item: item });
        }

      });
    });
  });

  app.post("/inventory/:inventoryId", (req, res) => {
    //flash message update
    FLASHRESETFLAG = 0;
    FLASHMESSAGE = 'Item succesfully updated!';
    //flash message
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
        FLASHMESSAGE = 'User not recognized!';

      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
        FLASHMESSAGE = 'Unathorized Access Detected! Logged out?';
        res.redirect("/inventory");
      }
      else {
        InventoryItem.findByIdAndUpdate(req.params.inventoryId,
          {
            name: req.body.name,
            description: req.body.description,
            sn: req.body.sn
          },
          (err) => {
            if (err) {
              console.error(err);
              FLASHMESSAGE = 'Failed to Update Item!';
            }

            res.redirect("/inventory");
          });

      }
    });
  });

  app.post("/inventory/:inventoryId/delete", (req, res) => {
    //flash message update
    FLASHRESETFLAG = 0;
    FLASHMESSAGE = 'Item Successfully Deleted!';
    //flash message    
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
        FLASHMESSAGE = 'User not recognized!';
      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
        FLASHMESSAGE = 'Unathorized Access Detected! Logged out?';
        res.redirect("/inventory");
      }
      else {
        InventoryItem.findByIdAndDelete(req.params.inventoryId, (err) => {
          if (err) {
            console.error(err.message);
            FLASHMESSAGE = 'Failed to Delete Item!';
          }

          res.redirect("/inventory");
        });
      }
    });
  });

  app.get("/inventory/:inventoryId/edit", (req, res) => {
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
        res.redirect("/inventory");
      }
      else {
        InventoryItem.findById(req.params.inventoryId, (err, item) => {
          if (err) {
            console.error(err);
          }

          res.render("./inventory/inventoryItemEditFormOrg.ejs", { item: item });

        });
      }
    });
  });

  app.get("/inventory/:inventoryId/status", (req, res) => {
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
        res.redirect("/inventory");
      }
      else {
        InventoryItem.findById(req.params.inventoryId, (err, item) => {
          if (err) {
            console.error(err);
          }

          res.render("./inventory/inventoryItemStatusChangeOrg.ejs", { item: item });

        });
      }
    });
  });

  app.post("/inventory/:inventoryId/status", (req, res) => {
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
        res.redirect("/inventory");
      }
      else {
        var updateObject = {
          checkedOut: req.body.checkedOut
        }

        if (req.body.checkedOut === "true") {
          updateObject.checkedOutBy = req.body.checkedOutBy
        }
        else {
          updateObject.checkedOutBy = ""
        }

        InventoryItem.findByIdAndUpdate(req.params.inventoryId, updateObject, (err) => {
          if (err) {
            console.error(err);
          }

          res.redirect("/inventory");
        });

      }
    });
  });


// PROFILE

  app.get("/profile", (req, res) => {
    if (FLASHRESETFLAG == 1) {
      FLASHMESSAGE = ""
      FLASHRESETFLAG = 0;
    }
    if (auth.sessions[req.cookies.session]) {
      User.findById(auth.sessions[req.cookies.session], (err, user) => {
        if (err) {
          console.log(err.message);
          FLASHMESSAGE = 'MongoDb fetch user error!';
        }
        else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
          FLASHRESETFLAG = 1;
          res.render("./profile/profile.ejs", { user: user, FLASHMESSAGE: FLASHMESSAGE });
        }
        else {
          FLASHRESETFLAG = 1;
          res.render("./profile/profileOrg.ejs", { user: user, FLASHMESSAGE: FLASHMESSAGE });
        }
      });
    }
    else {
      res.redirect("/login");
    }
  });

  app.get("/profile/:userId/edit", (req, res) => {
    if (auth.sessions[req.cookies.session]) {
      User.findById(auth.sessions[req.cookies.session], (err, user) => {
        if (err) {
          console.log(err.message);
        }
        else {
          res.render("./profile/editProfile.ejs", { user: user });
        }
      });
    }
    else {
      res.redirect("/login");
    }
  });

  app.post("/profile/:userId", (req, res) => {
    //flash message update
    FLASHRESETFLAG = 0;
    FLASHMESSAGE = 'Profile succesfully updated!';
    //flash message
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
      }
      else {
        User.findByIdAndUpdate(req.params.userId,
          {
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            phone: req.body.phone,
            department: req.body.department,
            category: req.body.category
          },
          (err) => {
            if (err) {
              console.error(err);
              FLASHMESSAGE = 'Failed MongoDb User fetch!';
            }

            res.redirect("/profile");
          });
      }
    });
  });


 // LOGIN & REGISTER

  app.get("/login", (req, res) => {
    if (auth.sessions[req.cookies.session]) {
      res.redirect("/events");
    }
    else {
      FLASHRESETFLAG=1;
      res.render("./profile/loginForm.ejs",{ FLASHMESSAGE: FLASHMESSAGE });
    }
  });

  app.post("/login", (req, res) => {
    if (auth.sessions[req.cookies.session]) {

      res.redirect("/events");
    }
    else {
      if (!req.body.email || req.body.email.trim() === "") {
        res.json({ message: "missing email" });
      }
      else if (!req.body.password || req.body.password.trim() == "") {
        res.json({ message: "missing password" });
      }

      User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
          console.error(err);
          res.json({ message: "something messed up" });
        }
        else if (!user) {
          res.json({ message: "no account with email/password combination" });
        }
        else {
          bcrypt.compare(req.body.password, user.password, function (err, result) {
            if (err) {
              console.log(err);
            }
            else if (!result) {
              res.json({ message: "try again" });
            }
            else {
              auth.sessions[req.cookies.session] = user._id;
              //res.json({ message: "Successful Login!"});
              //flash message update
              FLASHRESETFLAG = 0;
              FLASHMESSAGE = 'Successful Login!';
              //flash message
              res.redirect("/events");
            }
          });
        }
      });
    }
  });

  app.get("/login", (req, res) => {
    if (auth.sessions[req.cookies.session]) {
      res.redirect("/events");
    }
    else {
      res.render("./profile/loginForm.ejs");
    }
  });

  app.post("/logout", (req, res) => {
    //flash message
    FLASHMESSAGE = 'Successfully logged out!';
    FLASHRESETFLAG = 0;
    //flash message
    if (auth.sessions[req.cookies.session]) {
      auth.sessions[req.cookies.session] = null;
      res.redirect('/events');
    }
    else {
      res.redirect("/events");
    }
  });

  app.get("/register", (req, res) => {
    res.render("./profile/registerUserForm.ejs");
  });

  app.post("/register", (req, res) => {
    FLASHMESSAGE = 'Successfully registered!';
    FLASHRESETFLAG = 0;
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) {
        console.error(err.message);
      }
      else if (user) {
        res.json({ message: "email already in use" });
      }
      else {
        if (!req.body.fname || req.body.fname.trim() === "") {
          res.json({ message: "missing fname" });
        }
        else if (!req.body.lname || req.body.lname.trim() === "") {
          res.json({ message: "missing lname" });
        }
        else if (!req.body.password || req.body.password.trim() === "") {
          res.json({ message: "missing password" });
        }
        else if (!req.body.category || req.body.category.trim() === "") {
          res.json({ message: "missing category" })
        }
        else if (!req.body.email || req.body.email.trim() === "") {
          res.json({ message: "missing email" });
        }
        else if (req.body.category.trim() === "organizer" || req.body.category.trim() === "admin") {
          res.json({ message: "only admins can create these types of accounts" });
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

          bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            if (err) {
              console.error(err.message);
              res.send({ message: "unable to hash password" });
            }
            else {
              user.password = hashedPassword;

              user.save((err) => {
                if (err) {
                  console.error(err.message);
                  res.json({ message: "unable to save user" });
                }
                else {
                  // res.json({ message: "user saved successfully" });
                  res.redirect("/login");
                }
              });
            }
          });
        }
      }
    });
  });



// AUDIT
  app.get("/audit/:userEmail", (req, res) => {
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
        res.json({ message: "not authorized" });
      }
      else {
        User.findOne({ email: req.params.userEmail }, (err, user) => {
          if (err) {
            console.error(err);
            res.json({ message: "error" });
          }
          else if (!user) res.json({ message: "invalid email" });
          else {

            Event.find({}, (err, events) => {
              if (err) console.error(err);

              let results = [];

              for (let i = 0; i < events.length; i++) {
                for (let j = 0; j < events[i].attendees.length; j++) {
                  if (events[i].attendees[j].userId == user._id && events[i].attendees[j].didAttend) {
                    results.push(events[i]);
                  }
                }
              }

              res.json({ results });

            });
          }
        });
      }
    });
  });

  app.get("/audit", (req, res) => {


    // dev mode add regex
      // var sWord = auth.sessions[req.cookies.session].toString()
      //console.log(sWord)
      // conflicts: 'findById' searches hidden model data
      //            'find' will search for data for model params
      //            '$regex matches cannot access 'findById' ?


      User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
        res.redirect("/events");
      }
      else {
        res.render("audit/auditOrg.ejs");
      }
    });
  });


  app.listen(port, () => {
    console.log("Listening on port " + port + "...");
  });
});
