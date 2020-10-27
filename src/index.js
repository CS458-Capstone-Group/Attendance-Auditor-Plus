/*
    module name:            index.js
    synopsis:               main entry point for the server. Brings
                            together routes and models to serve
                            clients webpages with correct info and
                            handle client requests to modify data.
    important functions:    app.use() adds functionality to the server
*/
const express = require("express");

const eventsRouter = require("./routes/api/events.js");
const guestsRouter = require("./routes/api/guests.js");
const inventoryRouter = require("./routes/api/inventory.js");
const organizersRouter = require("./routes/api/organizers.js");
const usersRouter = require("./routes/api/users.js");

const app = express();

const port = process.env.PORT || 5000;

app.use(express.static("public"));

app.use("/api/events", eventsRouter);
app.use("/api/guests", guestsRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/organizers", organizersRouter);
app.use("/api/users", usersRouter);

app.listen(port, () =>
{
    console.log("Listening on port " + port + "...");
});