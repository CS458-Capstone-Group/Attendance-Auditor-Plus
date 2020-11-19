/*
    module name:            index.js
    synopsis:               main entry point for the server. Brings
                            together routes and models to serve
                            clients webpages with correct info and
                            handle client requests to modify data.
    important functions:    app.use() adds functionality to the server
*/
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const eventsRouter = require("./routes/api/events.js");
const guestsRouter = require("./routes/api/guests.js");
const inventoryRouter = require("./routes/api/inventory.js");
const organizersRouter = require("./routes/api/organizers.js");
const membersRouter = require("./routes/api/members.js");


const app = express();

const port = process.env.PORT || 5000;

mongoose.connect("mongodb+srv://readwrite:humboldt!1@cluster0.0sjmg.mongodb.net/attendanceauditor?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const db = mongoose.connection;
db.on("error", () => console.error("connection error"));
db.once("open", () => {
    app.use(express.static(path.join(__dirname, "public")));

    app.use(express.json());

    app.use("/api/events", eventsRouter);
    app.use("/api/guests", guestsRouter);
    app.use("/api/inventory", inventoryRouter);
    app.use("/api/organizers", organizersRouter);
    app.use("/api/members", membersRouter);

    /*const testSchema = new mongoose.Schema({
        message: String
    });

    const Test = mongoose.model("Test", testSchema);

    app.get("/api/test", (req, res) => {
        const t = new Test({message: "Hey!"});

        t.save((err, data) => {
            if (err) console.log(err);
        });

        res.sendStatus(200);
    });
    */

    app.listen(port, () => {
        console.log("Listening on port " + port + "...");
    });
});
