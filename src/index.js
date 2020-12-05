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

const app = express();
const port = process.env.PORT || 5000;

mongoose.connect(
  "mongodb+srv://readwrite:humboldt!1@cluster0.0sjmg.mongodb.net/attendanceauditor?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
);

const db = mongoose.connection;
db.on("error", () => console.error("connection error"));
db.once("open", () => {
  app.set("views", __dirname + "\\views");
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

      res.render("events.ejs", { events: events });
    });
  });

  app.get("/events/:eventId", (req, res) => {
    Event.findById(req.params.eventId, (err, event) => {
      if (err) {
        console.log(err.message);
      }

      res.render("eventDetails.ejs", { event: event });
    });
  });

  app.get("/inventory", (req, res) => {
    InventoryItem.find({}, (err, items) => {
      if (err) {
        console.log(err.message);
      }

      res.render("inventory.ejs", { items: items });
    });
  });

  app.listen(port, () => {
    console.log("Listening on port " + port + "...");
  });
});
