module.exports = function (config, db) {
    var path = require('path');
    var express = require('express');        // call express
    var app = express();                 // define our app using express
    
    var session = require('express-session');
    var bodyParser = require('body-parser');
    var passport = require('passport');
    var unirest = require('unirest');
    var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
    
    // Middleware part...
    // TODO: Maybe would like to set pug on the web router...
    app.set("view engine", "pug");
    app.set("views", path.resolve("views"));
    
    // configure app to use bodyParser()
    // this will let us get the data from a POST
    // app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    
    app.use(session({ secret: config.get("server.secret"), resave: true, saveUninitialized: true})); // TODO: Set this to secure... and also use a session store
    
    app.use(passport.initialize());
    app.use(passport.session());
    
    var port = process.env.PORT || config.get("server.port");        // set our port
    
    passport.use(new LocalStrategy(
        function(username, password, done) {
            username = username != null ? username : "";
            password = password != null ? password : "";
            return db.User.findOne({
                where: {
                    email: username
                }
            }).then(
                user => {
                    // Validate Password
                    if(user) {
                        if (!user.validPassword(password)) {
                            return done(null, false, { 
                                username: username,
                                message: 'Invalid username or password.' 
                            });
                        }
                        else if (user.activatedOn) {
                            return done(null, false, { 
                                username: username,
                                message: 'Admin hasn\'t approved your request for membership yet. Please be patient.' 
                            });
                        } else {
                            return done(null, user);
                        }
                    } else {
                        console.log("Login Unauthorized");
                        return done(null, false, { 
                            username: username,
                            message: 'Invalid username or password.' 
                        });
                    }
                    
                },
                err => {
                    console.error("Failed: " + err);
                    
                    return done(null, false, { message: 'Incorrect username.' });
                }
            ).catch(error => {
                console.log("Passport Error: ", error);
                return done(error);
            })
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
      
    passport.deserializeUser(function(id, done) {
        // TODO: Add memberships and things like that...
        return db.User.findById(id, {
            attributes: ['id', 'level', 'firstName', 'lastName', 'emailConfirmedOn'],
            include: {
                association: db.User.UserRoles,
                include: {
                    model: db.Role,
                    attributes: ['type', "membershipId"],
                }
            }
        }) // TODO: Limit attributes...
        .then(user => {
            return done(null, user);
        }).catch(error => {
            return done(error);
        })
    
    });
    
    // TODO: Set passport to use sequelize data store...
    
    // ROUTES FOR OUR API
    // =============================================================================
    var email = require("./email.js")({
        config: config
    });

    var routerOptions = {
        email: email,
        app: app,
        express: express,
        db: db,
        config: config,
        passport: passport
    }

    

    var apiRouter = require('./routers/api/index.js')(routerOptions);              // get an instance of the express Router
    var webRouter = require('./routers/index.js')(routerOptions);
    
    // REGISTER OUR ROUTES -------------------------------
    // all of our routes will be prefixed with /api
    app.use('/api', apiRouter);
    app.use('/', webRouter);
    
    
    // This is where we are gonna serve the public website...
    // TODO: Activate the server static files...
    
    // START THE SERVER
    // =============================================================================
    app.listen(port);
    
    console.log('Access the server on localhost:' + port);

    return app;
};