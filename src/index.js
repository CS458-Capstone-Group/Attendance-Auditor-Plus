/*
    module name:            index.js
    synopsis:               main entry point for the server. Brings
                            together routes and models to serve
                            clients webpages with correct info and
                            handle client requests to modify data.
    important functions:    app.use() adds functionality to the server
*/

//we are in development
if (process.env.NODE_ENV !== "production") {
  //require('dotenv').config();
}

const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");

const Event = require("./models/event.js");
const InventoryItem = require("./models/inventoryItem.js");
const User = require("./models/user.js");

const app = express();
const port = process.env.PORT || 5000;

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
    Event.find({}, (err, events) => {
      if (err) {
        console.log(err.message);
      }

      res.render("events.ejs", { events: events });
    });
  });

  //app.post('/events', checkAuthenticated, (req, res) => {
  app.get("/events", (req, res) => {
    Event.find({}, (err, events) => {
      if (err) {
        console.log(err.message);
      }

      res.render("eventsOrg.ejs", { events: events });
      //res.render("events.ejs", { events: events });
    });
  });

  app.get("/events/:eventId", (req, res) => {
    Event.findById(req.params.eventId, (err, event) => {
      if (err) {
        console.log(err.message);
      }

      //res.render("eventDetails.ejs", { event: event });
      res.render("eventDetailsOrg.ejs", { event: event });
    });
  });

  app.get("/inventory", (req, res) => {
    InventoryItem.find({}, (err, inventory) => {
      if (err) {
        console.log(err.message);
      }

      res.render("inventory.ejs", { inventory: inventory });
      //res.render("inventoryOrg.ejs", { inventory: inventory });
    });
  });

  app.post("/register", (req, res) => {
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

          bcrypt.hash(req.body.password, 10, (err) => {
            if (err) {
              console.error(err.message);
              res.send({ message: "unable to hash password" });
            }
            else {
              user.save((err) => {
                if (err) {
                  console.error(err.message);
                  res.json({ message: "unable to save user" });
                }
                else {
                  res.json({ message: "user saved successfully" });
                }
              });
            }
          });
        }
      }
    });
  });

  app.listen(port, () => {
    console.log("Listening on port " + port + "...");
  });
});
