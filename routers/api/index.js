/**
 * This router handles things related to the web api requests...
 */
module.exports = function (options) {
    var express = options.express;
    var db = options.db;
    var email = options.email;
    var config = options.config;

    var router = express.Router();

    router.get('/hotlinebling', function(request, response) {
        response.json({ message: 'Can only mean one thing' });   
    });

    router.get('/resend-confirmation', function(request, response) {
        if(request.user) {
            // TODO: Resend confirmation email...
            if(request.user.emailConfirmedOn != null) {
                response.status(500).send("You are already confirmed.");
            } else {
                db.Confirmation.findOne({
                    where: {
                        userId: request.user.id
                    },
                    include: [
                        {
                            model: db.User,
                            attributes: ['id', 'email', 'firstName', 'lastName']
                        }
                    ]
                }).then(confirmation => {
                    if(confirmation) {
                        if(confirmation.sent > config.get("email.maxConfirmationEmails")) {
                            response.status(500).send("We have sent all the confirmation emails we could :(");
                        } else {

                            email.sendConfirmationEmail(
                                confirmation.user.firstName, 
                                confirmation.token, 
                                confirmation.user.email, 
                                function (info) {
                                    // Confirmation email sent successfully...
                                    return confirmation.increment({
                                        'sent': 1
                                    })
                                }, function(error){
                                    console.error("Failed to resend confirmation: " + error);
                                    // TODO: Log errors...
                                    //response.status(500).send("Having technical difficulities.");
                                } );

                            response.json({ message: 'Confirmation will be resent... check email.' });   
                                
                        }
                    } else {
                        response.status(500).send("Please re-register with a different email because korruption...");
                    }
                })
            }
            
        } else {
            response.status(401).send("You don't have the cred to be in these streets.");
        }
        
    });

    router.route('/membership/results')
        .post(function(request, response) {
            if(request.user) {
                if(!request.user.isAdminOfMembership(request.params.membershipId)) {
                    response.status(401).send("You don't have the cred to be in these streets.");
                    return;
                }
                // TODO result... I'm quite sure I had the code for this...
            } else {
                response.status(401).send("You don't have the cred to be in these streets.");
            }

        })
        .get(function(request, response, next) {
            if(request.user) {
                db.User.findById(request.user.id, {
                    attributes: ['id', 'level', 'firstName', 'lastName'],
                    include: [
                        {
                            association: db.User.UserMemberships,
                            include: {
                                model: db.Membership,
                                attributes: ['id', 'name', 'description'],
                                include: {
                                    model: db.MatchDay,
                                    where: {
                                        until: {
                                            $lt: new Date()
                                        }
                                    },
                                    include: {
                                        model: db.Board,
                                        include: {
                                            model: db.Match,
                                            where: {
                                                championId: {
                                                    $ne: null
                                                },
                                                challengerId: {
                                                    $ne: null
                                                },
                                            },
                                            // TODO: Find out how to include champion and challenger
                                            include: [
                                                {
                                                    association: db.Match.Result,
                                                    include: [
                                                        {
                                                            association: db.Result.Winner,
                                                            attributes: ['id', 'level', 'firstName', 'lastName']
                                                        },
                                                        {
                                                            association: db.Result.Loser,
                                                            attributes: ['id', 'level', 'firstName', 'lastName']
                                                        }
                                                    ]
                                                },
                                                {
                                                    association: db.Match.Champion,
                                                    attributes: ['id', 'level', 'firstName', 'lastName']
                                                },
                                                {
                                                    association: db.Match.Challenger,
                                                    attributes: ['id', 'level', 'firstName', 'lastName']
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        },
                        {
                            association: db.User.UserRoles,
                            include: {
                                model: db.Role,
                                attributes: ['type'],
                            }
                        }
                    ]
                }).then(user => {
                    response.json(user);
                })
            } else {
                response.status(401).send("You don't have the cred to be in these streets.");
            }
        });

    router.route('/membership/:membershipId/matchday')
        .post(function(request, response) {
            if(request.user) {
                if(!request.user.isAdminOfMembership(request.params.membershipId)) {
                    response.status(401).send("You don't have the cred to be in these streets.");
                    return;
                }

                // Okay... here wer are gonna be creating a match day...
                var venue = request.body.venue;
                var day = new Date(request.body.day);
    
                var fromHours = request.body.from.split(':');
                var from = new Date(request.body.day);
                from.setHours(fromHours[0], fromHours[1]);
    
                var untilHours = request.body.until.split(':');
                var until = new Date(request.body.day);
                until.setHours(untilHours[0], untilHours[1]);
    
                if (until < from) {
                    response.status(400).send('From time is less the sent time...');
                    return;
                }
    
                // TODO: Don't allow matchday happen at the same time and place...
                db.Membership.findById(request.params.membershipId)
                    .then(membership => {
                        if(membership) {
                            db.MatchDay.create({
                                from: from,
                                until: until,
                                venue: venue,
                                membershipId: membership.id
                            }).then(matchDay => {
                                response.json(matchDay);
                            })
                        } else {
                            response.status(400).send('Don\'t know which group you looking fors');
                        }
                    })
            } else {
                response.status(401).send("You don't have the cred to be in these streets.");
            }
    
        })

    
    router.route('/membership/')
        .get(function(request, response, next) {
            if(request.user) {
                // TODO: Narrow down to search to user chess club...
                db.User.findById(request.user.id, {
                    attributes: ['id', 'level', 'firstName', 'lastName'],
                    include: [
                        {
                            association: db.User.UserMemberships,
                            include: {
                                model: db.Membership,
                                attributes: ['id', 'name', 'description'],
                                include: {
                                    model: db.MatchDay,
                                    where: {
                                        until: {
                                            $gt: new Date()
                                        }
                                    },
                                    include: {
                                        model: db.Board,
                                        include: {
                                            model: db.Match,
                                            // TODO: Find out how to include champion and challenger
                                            include: [
                                                {
                                                    association: db.Match.Champion,
                                                    attributes: ['id', 'level', 'firstName', 'lastName']
                                                },
                                                {
                                                    association: db.Match.Challenger,
                                                    attributes: ['id', 'level', 'firstName', 'lastName']
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        },
                        {
                            association: db.User.UserRoles,
                            include: {
                                model: db.Role,
                                attributes: ['type'],
                            }
                        }
                    ]
                }).then(user => {
                    response.json(user);
                })
            } else {
                response.status(401).send("You don't have the cred to be in these streets.");
            }
        });

    // TODO: Comment these functions...
    router.route('/match/:matchid')
        .get(function(request, response, next){
            if(request.user){ 
                db.Match.findById(request.params.matchid, {
                    // TODO: Ensure that the match should be still to happening...
                    include: [
                        {
                            model: db.User,
                            attributes: ['id', 'level', 'firstName', 'lastName']
                        },
                        {
                            model: db.Board // Trying to add parent object...
                        }
                    ]
                })
                .then(match => {
                    if(match) {
                        response.json(match);
                    } else {
                        response.status(400).send("Match not found");
                    }
                })
            } else {
                response.status(401).send("You don't have the cred to be in these streets.");
            } 
        });
    
    router.route('/membership/:membershipId/match/:matchid/challenge')
        .post(function(request, response, next){
            if(request.user){ 
                // TODO: Confirm that the user isn't hogging the board...
                if(!request.user.isMemberOfMembership(request.params.membershipId)) {
                    response.status(401).send("You don't have the cred to be in these streets.");
                    return;
                }
                db.Match.findById(request.params.matchid, {
                    where: {
                        from: { 
                            $gt: new Date() 
                        }
                    },
                    include: [
                        {
                            association: db.Match.Champion,
                            attributes: ['id', 'level', 'firstName', 'lastName']
                        },
                        {
                            association: db.Match.Challenger,
                            attributes: ['id', 'level', 'firstName', 'lastName']
                        }
                    ]
                })
                    .then(match => {
                        if(match) {
                            // TODO: add this user as a champion or challenger for this match...
                            if(match.champion == null) {
                                // match.championId = request.user.id;
                                // match.Champion = request.user;
                                console.log("Creating: A champion");
                                match.update({
                                    champion: request.user,
                                    championId: request.user.id
                                }).then(updateMatch => {
                                    response.json(updateMatch);
                                })
                            } else if (match.challenger == null && match.championId != request.user.id) {
                                //match.challengerId = request.user.id;
                                // match.Challenger = request.user;
                                console.log("Creating: A challenger");
                                match.update({
                                    challenger: request.user,
                                    challengerId: request.user.id
                                }).then(updateMatch => {
                                    response.json(updateMatch);
                                })
                            } else {
                                // TODO: Return error message...
                                response.status(400).send({ message: "We can't accept your challenge :("});
                                return;
                                // suggest user challenges winner
                            }
                        } else {
                            // TODO: Return error message...
                            response.status(400).send({message: "Match is unavaible."});
                        }
                    })
            } else {
                response.status(401).send({message: "You don't have the cred to be in these streets."});
            } 
        })
        .delete(function(request, response, next){
            if(request.user){ 
                // TODO: Confirm that the user is in the correct chess club...
                db.Match.findById(request.params.matchid)
                    .then(match => {
                        if(match) {
                            console.log("Trying to post challenge for: ", match);
                            // TODO: add this user as a champion or challenger for this match...
                            if(match.championId == request.user.id) {
                                // Remove this user from match
                                if(match.challengerId != null) {
                                    // Make challenger champion
                                    match.update({
                                        championId: match.challengerId,
                                        challengerId: null
                                    }).then(updateMatch => {
                                        response.json(updateMatch);
                                    })
                                } else {
                                    match.update({
                                        championId: null
                                    }).then(updateMatch => {
                                        response.json(updateMatch);
                                    })
                                }
                            } else if (match.challengerId == request.user.id) {
                                match.update({
                                    challengerId: null
                                }).then(updateMatch => {
                                    response.json(updateMatch);
                                })
                            } else {
                                // TODO: Return error message...
                                response.status(400).send({message: "You are not in this match"});
                                return;
                                // suggest user challenges winner
                            }
                            return;
                        } else {
                            // TODO: Return error message...
                            response.status(400).send({message: "Match doesn't exist"});
                            return;
                        }
                    })
            } else {
                // TODO: Return error message...
                response.status(401).send({message: "You don't have the cred to be in these streets."});
                return;
            }
        })
    
    router.route('/membership/:membershipId/match/:matchid/result')
        .post(function(request, response, next){
            if(request.user){ 
                if(!request.user.isAdminOfMembership(request.params.membershipId)) {
                    response.status(401).send("You don't have the cred to administrate in these streets.");
                    return;
                }
                console.log("Deleting: ", request.body);
                // TODO: Confirm that the user is in the correct chess club...
                db.Match.findById(request.params.matchid) // TODO: Add where #lt new Date
                    .then(match => {
                        if(match && (match.championId == request.body.winnerId || match.challengerId == request.body.winnerId)) {
                            // TODO: add this user as a champion or challenger for this match...
                            if(match.resultId != null) {
                                // 
                                response.status(400).send({message: "Result already exists..."});
                            } else {
                                loserId = match.championId == request.body.winnerId ? match.challengerId : match.championId;
                                db.Result.create({
                                    matchId: match.id,
                                    winnerId: request.body.winnerId,
                                    loserId: loserId
                                }).then (result => {
                                    response.json(result);
                                })
                                
                                return;
                                // suggest user challenges winner
                            }
                            return;
                        } else if (request.body.winnerId == -1) {
                            db.Result.create({
                                matchId: match.id,
                                isDraw: new Date()
                            }).then (result => {
                                response.json(result);
                            })
                            
                            return;
                            // suggest user challenges winner
                        } else {
                            // TODO: Return error message...
                            response.status(400).send({message: "Match doesn't exist"});
                            return;
                        }
                    })
            } else {
                // TODO: Return error message...
                response.status(401).send({message: "You don't have the cred to be in these streets."});
                return;
            }
        })
        .delete(function(request, response, next){
            if(request.user){ 
                // TODO: Confirm that the user is in the correct chess club...
                db.Match.findById(request.params.matchid) // TODO: Add where #lt new Date
                    .then(match => {
                        if(match) {
                            db.Result.destroy({
                                where: {
                                    matchId: match.id
                                }
                            })
                            .then(() => {
                                // TODO: Notify effected players...
                                match.update({
                                    resultId: null
                                }).then(updateMatch => {
                                    response.json(updateMatch);
                                })
                            })
                        } else {
                            response.status(400).send({message: "Result doesn't exists"});
                        }
                    })
            } else {
                // TODO: Return error message...
                response.status(401).send({message: "You don't have the cred to be in these streets."});
                return;
            }
        })
    
    router.route('/membership/:membershipId/board')
        .post(function(request, response) {
            if(request.user) {
                if(!request.user.isAdminOfMembership(request.params.membershipId)) {
                    response.status(401).send("You don't have the cred to be in these streets.");
                    return;
                }
                // Okay... here wer are gonna be creating a match day...
                var match_day_id = request.body.match_day_id;
                var duration = request.body.duration;
                var board_name = request.body.board_name;
                // TODO: Don't allow matchday happen at the same time and place...
                
                db.MatchDay.findById(match_day_id)
                    .then(matchDay => {
                        // TODO: Ensure matchday belongs to a club that the user is a part of...
                        // It would be nice to check the chess club... but any who...
                        db.Board.create({
                            duration: duration,
                            name: board_name,
                            matchDayId: matchDay.id
                        }).then(board => {
                            var diff = matchDay.until - matchDay.from;
                            
                            var minimumPlayableMatches = (diff/60000)/(duration*2);
                            console.log("Number of minimum Playable matches is: " + minimumPlayableMatches);
                            var matches = [];
                            for(var i = 0; i < minimumPlayableMatches; i++) {
                                console.log(i);
                                var matchTime = matchDay.from;
                                // TODO: Move match time by incrementing...
                                matchTime.ad
                                matches.push(
                                    {
                                        time: new Date(matchDay.from.getTime() + (2*duration*i*60000)),
                                        boardId: board.id
                                    }
                                )
                            }
                            // TODO: Create bulk matches 
                            db.Match.bulkCreate(matches)
                                .then(() => {
                                    // We got this...
                                    db.Board.findById(board.id,{
                                            include: {
                                                model: db.Match,
                                                // TODO: Find out how to include champion and challenger
                                                include:  [
                                                    {
                                                        association: db.Match.Champion,
                                                        attributes: ['id', 'level', 'firstName', 'lastName']
                                                    },
                                                    {
                                                        association: db.Match.Challenger,
                                                        attributes: ['id', 'level', 'firstName', 'lastName']
                                                    }
                                                ]
                                            }
                                        })
                                        .then(matchedBoard => {
                                            response.json(matchedBoard);
                                        });
                                })
    
                            
                        })
                    })
            } else {
                response.status(401).send({message: "You don't have the cred to be in these streets."});
            }
        })
    
    router.route('/membership/:membershipId/board/:boardId')
        .delete(function(request, response) {
            if (request.user) {
                if(!request.user.isAdminOfMembership(request.params.membershipId)) {
                    response.status(401).send("You don't have the cred to be in these streets.");
                    return;
                }
                db.Board.findById(request.params.boardId,{
                    include: {
                        model: db.Match,
                        // TODO: Find out how to include champion and challenger
                        include:  [
                            {
                                association: db.Match.Champion,
                                attributes: ['id', 'level', 'firstName', 'lastName']
                            },
                            {
                                association: db.Match.Challenger,
                                attributes: ['id', 'level', 'firstName', 'lastName']
                            }
                        ]
                    }
                })
                .then(board => {
                    if(board) {
                        var effectedPlayers = {};
    
                        for(var i in board.matches){
                            var match = board.matches[i];
                            if(match.championId)
                                effectedPlayers[match.championId] = match;
                            if(match.challengerId) 
                                effectedPlayers[match.challengerId] = match;
                        }
                        db.Match.destroy({
                            where: {
                                boardId: board.id
                            }
                        }).then(() => {
                            // TODO: Notify effected players...
                            console.log("We deleted Matches...");
                            board.destroy()
                                .then(() => {
                                    // Success...
                                    console.log("We deleted board...");
                                    response.status(200).send({message: "Board has been deleted..."});
                                })
                        })
                        
                    }
                })
            } else {
                response.status(401).send({message: "You don't have the cred to be in these streets."});
            }
        })
    

    router.use(function (request, response, next) {
        response.status(500).json({
            message: "Server error..."
        });
    })

    return router;
};