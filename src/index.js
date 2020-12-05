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

const app = express();
const port = process.env.PORT || 5000;

mongoose.connect(
  "mongodb+srv://readwrite:humboldt!1@cluster0.0sjmg.mongodb.net/attendanceauditor?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
);

const db = mongoose.connection;
db.on("error", () => console.error("connection error"));
db.once("open", () => {
  app.set("views", __dirname + "/public/views");
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

  //app.get('/', checkAuthenticated, (req, res) => {
  app.get("/", (req, res) => {
    res.render("index.ejs");
  });

  //app.get('/events', checkAuthenticated, (req, res) => {
  app.get("/index", (req, res) => {
    res.render("index.ejs");
  });

  //app.post('/events', checkAuthenticated, (req, res) => {
  app.post("/events", (req, res) => {
    //res.render('index.ejs', {name: req.user.name})
    res.render("index.ejs");
  });

  app.get("/inventoryItems", (req, res) => {
    res.render("inventoryItems.ejs");
  });

  app.get("/memberProfile", (req, res) => {
    res.render("memberProfile.ejs");
  });

  app.post("/memberProfile", (req, res) => {
    res.render("memberProfile.ejs");
  });

  //app.get('/login', checkNotAuthenticated, (req, res) => {
  app.get("/login", (req, res) => {
    res.render("login.ejs");
  });

  app.get("/register", (req, res) => {
    res.render("register.ejs");
  });

  app.listen(port, () => {
    console.log("Listening on port " + port + "...");
  });
});
