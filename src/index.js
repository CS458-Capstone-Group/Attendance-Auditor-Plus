/*
    module name:            index.js
    synopsis:               main entry point for the server. Brings
                            together routes and models to serve
                            clients webpages with correct info and
                            handle client requests to modify data.
    important functions:    app.use() adds functionality to the server
*/

//we are in development
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')    
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const methodOverride = require('method-override')

const mongoose = require("mongoose");
const path = require("path");
//const sanitize = require("sanitize");



const eventsRouter = require("./routes/api/events.js");
const guestsRouter = require("./routes/api/guests.js");
const inventoryRouter = require("./routes/api/inventory.js");
const organizersRouter = require("./routes/api/organizers.js");
const membersRouter = require("./routes/api/members.js");

const port = process.env.PORT || 5000;

mongoose.connect("mongodb+srv://readwrite:humboldt!1@cluster0.0sjmg.mongodb.net/attendanceauditor?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const db = mongoose.connection;
db.on("error", () => console.error("connection error"));
db.once("open", () => {

    const initializePassport = require('./passport-config')
    initializePassport(
        passport, 
        email => users.find(user => user.email === email),
        id => users.find(user => user.id === id)
    )

    //never use for production, just for authentication and login portion!!
    // OKAY FOR DEMO PURPOSES!
    const users =[]

    app.set('views', __dirname + '/public/views');
    app.set('view-engine', 'ejs')
    app.use(express.urlencoded({extended:false})) // we wanna be able to access varaibles inside our posts reqs
    app.use(flash())
    

    app.use(require('express-session')({secret: 'keyboard cat', resave: true, saveUninitialized:true}))

    app.use(passport.initialize())
    app.use(passport.session()) 
    /*
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false, // we don't wanna resave if nothing is changed
        saveUninitialized:false //do we want to save a value if there is none
    }))
    */
    app.use(methodOverride('_method'))

    //app.get('/', checkAuthenticated, (req, res) => {
    app.get('/', (req, res) => {
        res.render('index.ejs', {name: req.user.name})
    })

    //app.get('/events', checkAuthenticated, (req, res) => {
    app.get('/index', (req, res) => {

        res.render('index.ejs')
    })

    //app.post('/events', checkAuthenticated, (req, res) => {
    app.post('/events', (req, res) => {
        //res.render('index.ejs', {name: req.user.name})
        res.render('index.ejs')

    })

    app.get('/inventoryItems', (req, res) => {
        res.render('inventoryItems.ejs')
    })

    app.get('/memberProfile', (req, res) => {
        res.render('memberProfile.ejs')
    })

    app.post('/memberProfile', (req, res) => {
        res.render('memberProfile.ejs')
    })

    //app.get('/login', checkNotAuthenticated, (req, res) => {
    app.get('/login', (req, res) => {
        res.render('login.ejs')
    })

    
    //app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    app.post('/login', passport.authenticate('local', {

        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })
    )

    app.get('/register', checkNotAuthenticated, (req, res) => {
        res.render('register.ejs')
    })

    app.post('/register', checkNotAuthenticated, async (req, res) => {
        try{
            const hashedPassword = await bcrypt.hash(req.body.password, 10) //level 10 security!
            users.push({
                id: Date.now().toString(), //db makes this
                name: req.body.name,
                email: req.body.email,
                password:hashedPassword
            })
            res.redirect('/login')
        }catch {
            res.redirect('/register')
        }

        console.log(users)
    })

    app.delete('/logout', (req, res) => {
        req.logOut()
        res.redirect('/login')
    })

    //middleware fn
    function checkAuthenticated(req, res, next){
            if(req.isAuthenticated()){
                return next()
             }

             res.redirect('/login')
         }

    function checkNotAuthenticated(req, res, next) {
        if(req.isAuthenticated()){
            return res.redirect('/')
         }
        next()
    }

    app.use(express.static(path.join(__dirname, "public")));

    app.use(express.json());
   // app.use(sanitize.middleware);

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
