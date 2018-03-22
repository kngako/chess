// App starts by loading the persistence which will then load the server...

// TODO: Read and set configs...
var config = require("config");
var db = require('./persistence.js')(config);
var prompt = require('prompt');

db.LoadDB().then((config, dbInstance)=>{
    // We could probably run the things in the seeders...
    db.Membership.findAll({
        // TODO: Handle ordering business...
        include: [{
            association: db.Membership.Roles
        }]
    }) // TODO: Search for a root membership...
    .then(memberships => {
        if(memberships.length == 0) {
            console.log("Creating init Chess Club Membership");
            return db.Membership.create({
                name: "CSIR Chess Club",
                description: "CSIR Chess Club for the beginners and the experts...",
                roles: [
                    {
                        type: "member",
                        description: "All users should have this role..."
                    },
                    {
                        type: "admin",
                        description: "This role takes care of the things in the club..."
                    },
                    {
                        type: "superadmin",
                        description: "The God that can do all the things on the system..."
                    }
                ]
            }, {
                include: [{
                    association: db.Membership.Roles
                }]
            })
        } else {
            console.log("No need to create a chess club: " + JSON.stringify(memberships));
            return memberships[0];
        }
    })
    .then(membership => {
        // TODO: The things..
        return membership.roles;
    })
    .then(roles => {
        // Roles have been made and all...

        // Now we can create the admin account...
        var schema = {
            properties: {
                email: {
                    description: 'Enter admin email',     // Prompt displayed to the user. If not supplied name will be used. 
                    type: 'string',
                    message: 'Please enter admin email',
                    required: true
                },
                firstName: {
                    description: 'Enter admin first name',     // Prompt displayed to the user. If not supplied name will be used. 
                    type: 'string',
                    pattern: /^[a-zA-Z\s\-]+$/,
                    message: 'Name must be only letters, spaces, or dashes',
                    required: true
                },
                lastName: {
                    description: 'Enter admin last name',     // Prompt displayed to the user. If not supplied name will be used. 
                    type: 'string',
                    pattern: /^[a-zA-Z\s\-]+$/,
                    message: 'Last name must be only letters, spaces, or dashes',
                    required: true
                },
                phoneNumber: {
                    description: 'Enter admin phonenumber',     // Prompt displayed to the user. If not supplied name will be used. 
                    type: 'string',
                    message: 'Please enter phone number',
                    required: true
                },
                password: {
                    description: 'Enter admin password',     // Prompt displayed to the user. If not supplied name will be used. 
                    type: 'string',
                    message: 'Please enter admin password',
                    hidden: true,
                    replace: '*',
                    required: true
                }
            }
        };

        prompt.get(schema, function (err, result) {
            // Log all the things...
            db.User.create({
                email: result.email,
                firstName: result.firstName,
                lastName: result.lastName,
                phoneNumber: result.phoneNumber,
                password: result.password,
                emailConfirmedOn: Date.now(),
                activitedOn: Date.now(),
                level: "sigidli"
            })
            .then(user => {
                console.log("Created: ", user.firstName);
                console.log("Updated User Password: " + user.get("password"));

                // Create this Users Roles...
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
                    console.log("Created User Roles: "+ JSON.stringify(dbUserRoles))
                })
            })
            .catch(error => {
                console.error("Hanlde error: " + JSON.stringify(error));
            })
        });
    }) 
        // .then(admins => {
        //     // Do stuff...
        // });

        
});


