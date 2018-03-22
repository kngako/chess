/**
 * This router handles things related to the web browser experience...
 */
module.exports = function (options) {
    var path = require('path');

    var express = options.express;
    var db = options.db;
    var passport = options.passport;
    var email = options.email;

    var router = express.Router();

    router.route('/signup/')
        .get(function(request, response, next) {
            if(request.user){ // User is already logged in so don't go to matches again...
                response.redirect('/matches');
            } else {
                response.render("signup", {
                    pageTitle: "Chess Club - Signup"
                });
            }
        })
        .post(function(request, response, next){
            if(request.user){ // User is already logged in so don't go to matches again...
                response.status(400).json({
                    success: false,
                    message: "User already registered...",
                    field: "username"
                });
            } else {
                // TODO: Validate user input...
                if(request.body.password !== request.body.confirmPassword) { // TODO: Might do this on the database object...
                    // TODO: user flash...
                    response.status(400).json({
                        message: "Passwords don't match",
                        field: "confirmPassword"
                    });
                } else {
                    db.Membership.findOne({

                        // TODO: Handle ordering business...
                        include: [{
                            association: db.Membership.Roles,
                            where: {
                                type: "member"
                            }
                        }]
                    })
                    .then(membership => {
                        // Use default membership to create super admin...
                        var roles = membership.roles;
                
                        // Roles have been made and all...
                        console.log("We have the roles: " + JSON.stringify(roles)); 
                
                        console.log("Working on: " + membership.get('name'));
                        
                        // Now we can create the user account...
                        db.User.create({
                            email: request.body.username,
                            firstName: request.body.firstName,
                            lastName: request.body.lastName,
                            phoneNumber: request.body.phoneNumber,
                            password: request.body.password,
                            level: request.body.level,
                            activitedOn: Date.now() // TODO: don't activate if not through invitation...
                        }, {
                            include: [
                                {
                                    association: db.User.UserMemberships
                                },
                                {
                                    association: db.User.UserRoles
                                }
                            ]
                        })
                        .then(user => {
                            console.log("Created User: " + JSON.stringify(user)); 
                        
                            // TODO: Think about the below redundancy... 
                            db.UserMembership.create({
                                userId: user.id,
                                membershipId: membership.id
                            }).then (userMembership => {
                                console.log("Created User membership: " + userMembership);
                            })
            
                            var userRoles = [];
                            for(var i in roles) {
                                var role = roles[i];
                                userRoles.push({
                                    userId: user.id,
                                    roleId: role.id
                                })
                            };
                            db.UserRole.bulkCreate(userRoles)
                            .then(dbUserRoles => {
                                console.log("Created User Roles: "+ JSON.stringify(dbUserRoles));
                                // Assuming everything works... let's redirect this post to the login screen...
                                passport.authenticate('local')(request, response, () => {
                                    // TODO: Figure out what problems arises without saving session...
                                    response.json({
                                        success: true,
                                        message: "signup success"
                                    });
                                });

                                // Confirm email...
                                db.Confirmation.create({
                                    userId: user.id,
                                    sent: 0
                                }).then(confirmation => {
                                    email.sendConfirmationEmail(
                                        user.firstName, 
                                        confirmation.token, 
                                        user.email, 
                                        function (info) {
                                            // Confirmation email sent successfully...
                                            return confirmation.increment({
                                                'sent': 1
                                            })
                                        });
                                        // TODO: Add error callback to check what went wrong...
                                }).catch(error => {
                                    console.error("Confirmation fial: ", error);
                                });

                                // TODO: Add user to all other memberships they may have been invited too...
                            })
                        })
                        .catch(error => {
                            console.error("Hanlde error: ", error);
                        })
                    })
                    .catch(error => {
                        // TODO: Report error to user...
                        response.status(500).json({
                            message: "2 + 2 is 4 - 3 it's 1 simple math yo!"
                        });
                    });
                }
                
            }
        });

    var accessControl = function(request, response, next) {
        if (request.user && request.user.emailConfirmedOn == null) {
            response.redirect('/confirm-email');
        } else if(request.user){
            next();
        } else  {
            response.redirect('/login');
        }
    }

    router.route('/confirmation/:confirmationToken')
        .get(function(request, response, next){
            db.Confirmation.findById(request.params.confirmationToken, {
                // TODO: Ensure that the match should be still to happening...
                include: [
                    {
                        model: db.User,
                        attributes: ['id', 'level', 'firstName', 'lastName']
                    }
                ]
            })
            .then(confirmation => {
                if(confirmation) {
                    confirmation.user.update({
                        emailConfirmedOn: new Date()
                    }).then(() => {

                        return confirmation.destroy();
                    }).then(() => {
                        response.render("confirmation-success", {
                            pageTitle: "Chess Club - Confirmation Success"
                        });
                        // response.redirect("/confirmation-success");
                    })
                    .catch(error => {
                        console.error("Error Confirmation: ", error);
                        response.status(500).send("Confirmation failure.");
                    });
                } else {
                    // TODO: Render confirmation error...
                    response.status(400).send("Match not found");
                }
            })
        });
    // Matches... 
    router.route('/matches/')
        .get(function(request, response, next){
            if (request.user && request.user.emailConfirmedOn == null) {
                response.redirect('/confirm-email');
            } else if(request.user){
                response.render("matches", {
                    pageTitle: "Chess Club - Matches"
                });
            } else  {
                response.redirect('/login');
            }
        });

    router.route('/play-online/')
        .get(function(request, response, next){
            if (request.user && request.user.emailConfirmedOn == null) {
                response.redirect('/confirm-email');
            } else if(request.user){
                response.render("play-online", {
                    pageTitle: "Chess Club - Play Online"
                });
            } else  {
                response.redirect('/login');
            }
        });

    router.route('/chess-logs/')
        .get(function(request, response, next){
            if (request.user && request.user.emailConfirmedOn == null) {
                response.redirect('/confirm-email');
            } else if(request.user){
                response.render("chess-logs", {
                    pageTitle: "Chess Club - Logs"
                });
            } else  {
                response.redirect('/login');
            }
        });

    router.route('/match-result/')
        .get(function(request, response, next){
            if (request.user && request.user.emailConfirmedOn == null) {
                response.redirect('/confirm-email');
            } else if(request.user){
                response.render("match-result", {
                    pageTitle: "Chess Club - Match Results"
                });
            } else  {
                response.redirect('/login');
            }
        });

    router.route('/confirm-email/')
        .get(function(request, response, next){
            console.log("We should be here redirecting stuff...");
            if (request.user && request.user.emailConfirmedOn == null) {
                response.render("confirm-email", {
                    pageTitle: "Chess Club - Confirm email"
                });
            } else if(request.user){
                response.redirect('/matches');
            } else  {
                response.redirect('/login');
            }
        });

    // Login stuff..
    router.route('/login/')
        .get(function(request, response, next) {
            if(request.user){ // User is already logged in so don't go to matches again...
                response.redirect('/matches');
            } else {
                response.render("login", {
                    pageTitle: "Chess Club - Login"
                });
            }
        })
        .post(function(request, response, next) {
            if(request.user){ 
                // User is already logged in so don't go to matches again...
                response.redirect('/matches');
            } else {
                // Check arguments and handle the errors...
                passport.authenticate('local', (error, user, info) => {                
                    if(info) {
                        response.render("login", {
                            pageTitle: "Chess Club - Login"
                        });
                    }
                    if(user) {
                        request.logIn(user, function(err) {
                            if (err) { return next(err); }
                            return  response.redirect('/matches');
                        });  
                    }
                })(request, response, next);
            }
        });

    router.route('/')
        .get(function(request, response, next) {
            response.render("home", {
                pageTitle: "Chess Club - Home"
            });
        });

    router.route('/membership')
        .get(function(request, response, next) {
            response.render("membership", {
                pageTitle: "Chess Club - Membership"
            });
        });

    router.route('/contribute')
        .get(function(request, response, next) {
            response.render("contribute", {
                pageTitle: "Chess Club - Contribute"
            });
        });

    router.route('/terms-of-use')
        .get(function(request, response, next) {
            response.render("terms-of-use", {
                pageTitle: "Chess Club - Home"
            });
        });

    router.route('/cookie-policy')
        .get(function(request, response, next) {
            response.render("cookie-policy", {
                pageTitle: "Chess Club - Home"
            });
        });
    router.get('/logout', function(request, response){
        request.logout();
        response.redirect('/');
    });
    

    // var routes = {
    //     "/": true,
    //     "/login/": true,
    //     "/signup/": true,
    //     "/terms-of-use/": true,
    //     "/reset-password/": true,
    //     "/request-membership/": true,
    //     "/missing/": true,
    //     "/contribute/": true,
    //     "/confirm-email/": true,
    //     "/confirmation-success/": true,
    //     "/cookie-policy/": true,
    //     "/error/": true,
    //     "/matches/": true,
    //     "/match-result/": true,
    //     "/chess-logs/": true,
    //     "/play-online/": true,
    //     "/membership/": true
    // }

    // // I'm cheating by passing one index file to serve all directorie index files...
    // router.route('*/')
    //     .get(function(request, response, next) {
            
    //         if(request.url.endsWith("/") && routes[request.url] ){ // User is already logged in so don't go to matches again...
               
    //             console.log("Return: " + request.url);
    //             response.sendFile(path.resolve('public/index.html'));
    //         } else {
    //             next();
    //         }
    //     })

    // TODO: Add all sub routers here...
    

    // Last thing that should be done is serve static files... public first
    router.use(express.static('static')); 
    
    // router.use(function (request, response, next) {
    //     response.status(404).redirect("/missing");
    // })

    // router.use(function (request, response, next) {
    //     response.status(500).redirect("/error");
    // })
    return router;
};