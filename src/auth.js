const User = require("./models/user.js");

const auth = {};


auth.seshes = {};

auth.authOrganizer = function(req, res) {
    User.findById(seshes[req.cookies.session], (err, user) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({message: "Failure - access not allowed"});
        }
        else if (!user)
        {
            res.status(500).json({message: "Failure - access not allowed"})
        }
        else if (user.category !== "organizer" && user.category !== "admin") {
            res.status(500).json({message: "Failure - access not allowed"});
        }
        else {
            next();
        }
    });
}

auth.authAdmin = function(req, res) {
    User.findById(seshes[req.cookies.session], (err, user) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({message: "Failure - access not allowed"});
        }
        else if (!user)
        {
            res.status(500).json({message: "Failure - access not allowed"})
        }
        else if (user.category !== "admin") {
            res.status(500).json({message: "Failure - access not allowed"});
        }
        else {
            next();
        }
    });
}

module.exports = auth;