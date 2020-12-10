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

  app.post("/events/:eventId/attendance", (req, res) => {
    Event.findById(req.params.eventId, (err, event) => {
      if (err) console.error(err);

      console.log(req.body);
    });

    res.redirect("/events/" + req.params.eventId);
  });

  app.get("/", (req, res) => {
    res.redirect("/events");
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

      if (err) {
        console.log(err.message);
      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
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
    var now = new Date();
    var today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    Event.find({ date: { $gte: today } }).sort("date").sort("time").exec((err, events) => {
      if (err) {
        console.log(err.message);
      }

      User.findById(auth.sessions[req.cookies.session], (err, user) => {
        if (err) {
          console.log(err.message);
        }
        else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
          res.render("./events/events.ejs", { events: events });
        }
        else {
          res.render("./events/eventsOrg.ejs", { events: events });
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
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
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
            }

            res.redirect("/events");
          });

      }
    });
  });

  app.post("/events/:eventId/delete", (req, res) => {
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
        res.redirect("/events");
      }
      else {
        Event.findByIdAndDelete(req.params.eventId, (err) => {
          if (err) {
            console.error(err.message);
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
      var userId = auth.sessions[req.cookies.session];

      Event.findById(req.params.eventId, (err, event) => {
        if (err) console.error(err);

        for (let i = 0; i < event.attendees.length; i++) {
          if (event.attendees[i].userId === userId) {
            if (event.attendees[i].didRSVP === false) {
              event.attendees[i].didRSVP = true;
            }
            else {
              res.redirect("/events");
            }
          }
        }

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

            res.redirect("/events");
          });
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
            let actualUsersForReal = [];

            users.forEach(user => {
              event.attendees.forEach(attendee => {
                if (user._id == attendee.userId) {
                  actualUsersForReal.push({ email: user.email, attendInfo: attendee });
                }
              });
            });

            res.render("events/eventAttendance.ejs", { attendance: actualUsersForReal, eventId: req.params.eventId });
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















  //app default




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
    User.findById(auth.sessions[req.cookies.session], (err, user) => {


      if (err) {
        console.log(err.message);
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
          checkedOut: req.body.checkedOut,
          checkedOutBy: req.body.checkedOutBy
        });




        inventoryItem.save((err) => {
          if (err) {
            console.error(err);
            res.json({ message: "could not save item" });
          }
          else {

            res.redirect("/inventory");
          }
        });
      }
    });
  });

  app.get("/inventory", (req, res) => {
    console.log("app.get(/inventory)")
    InventoryItem.find({}, (err, inventory) => {
      if (err) {
        console.log(err.message);
      }
      User.findById(auth.sessions[req.cookies.session], (err, user) => {
        if (err) {
          console.log(err.message);
        }
        else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
          res.render("./inventory/inventory.ejs", { inventory: inventory });
        }
        else {
          res.render("./inventory/inventoryOrg.ejs", { inventory: inventory });
        }

      });


    });
  });

  app.get("/inventory/search/", (req, res) => {

    InventoryItem.find({ name: req.query.invName }, (err, inventory) => {
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
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
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
            }

            res.redirect("/inventory");
          });

      }
    });
  });

  app.post("/inventory/:inventoryId/delete", (req, res) => {
    User.findById(auth.sessions[req.cookies.session], (err, user) => {
      if (err) {
        console.log(err.message);
      }
      else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
        res.redirect("/inventory");
      }
      else {
        InventoryItem.findByIdAndDelete(req.params.inventoryId, (err) => {
          if (err) {
            console.error(err.message);
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


  app.get("/profile", (req, res) => {
    if (auth.sessions[req.cookies.session]) {
      User.findById(auth.sessions[req.cookies.session], (err, user) => {
        if (err) {
          console.log(err.message);
        }
        else if (!user || (user.category !== "organizer" && user.category !== "admin")) {
          res.render("./profile/profile.ejs", { user: user });
        }
        else {
          res.render("./profile/profileOrg.ejs", { user: user });
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
            }

            res.redirect("/profile");
          });
      }
    });
  });


  app.get("/login", (req, res) => {
    if (auth.sessions[req.cookies.session]) {
      res.redirect("/events");
    }
    else {
      res.render("./profile/loginForm.ejs");
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



  app.listen(port, () => {
    console.log("Listening on port " + port + "...");
  });
});
