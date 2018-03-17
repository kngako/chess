module.exports = function (config) {
    var db = {};
    var dbOptions = {
        db: db
    };

    dbOptions.Sequelize = require('sequelize');
    require('sequelize-hierarchy')(dbOptions.Sequelize);
    dbOptions.bcrypt = require('bcrypt'); // Used to hash the passwords...
    
    // Add the config of the things...
    var database = config.get('database.database');
    var username = config.get('database.username');
    var password = config.get('database.password');
    
    dbOptions.sequelize = new dbOptions.Sequelize(database, username, password, {
        host: config.get('database.host'),
        dialect: config.get('database.dialect'),
        
        // SQLite only
        storage: config.get('database.storage')
    }, {
        // don't delete database entries but set the newly added attribute deletedAt
        // to the current date (when deletion was done). paranoid will only work if
        // timestamps are enabled
        paranoid: true,
    });
    
    // Test out the connection
    dbOptions.sequelize
        .authenticate()
        .then(() => {
            console.log('Connection has been established successfully.');
        })
        .catch(err => {
            console.error('Unable to connect to the database:', err);
            // TODO: Fix 
        });
    
    // TODO: Import the modules...
    db.User = require('./models/user.js')(dbOptions);
    db.Role = require('./models/role.js')(dbOptions);
    db.UserRole = require('./models/userRole.js')(dbOptions);
    db.Location = require('./models/location.js')(dbOptions);
    db.MatchDay = require('./models/matchDay.js')(dbOptions);
    db.Board = require('./models/board.js')(dbOptions);
    db.Match = require('./models/match.js')(dbOptions);
    // require('./models/player.js')(dbOptions);
    db.Membership = require('./models/membership.js')(dbOptions);
    db.Result = require('./models/result.js')(dbOptions);
    db.Confirmation = require('./models/confirmation.js')(dbOptions);
    db.UserMembership = require('./models/userMembership.js')(dbOptions);

    // Time for the associations...
    // User 1:N associations
    db.User.UserRoles = db.User.hasMany(db.UserRole);
    db.UserRole.belongsTo(db.User);

    db.User.UserMemberships = db.User.hasMany(db.UserMembership);
    db.UserMembership.belongsTo(db.User);

    // User 1:1 associations
    db.User.hasOne(db.Confirmation);
    db.Confirmation.belongsTo(db.User);
    
    // Roles 1:N associations...
    db.Role.UserRoles = db.Role.hasMany(db.UserRole);
    db.UserRole.belongsTo(db.Role);

    // Memberships 1:N associations...
    db.Membership.Roles = db.Membership.hasMany(db.Role);
    db.Role.belongsTo(db.Membership); // I think this is the inverse?

    db.Membership.UserMemberships = db.Membership.hasMany(db.UserMembership);
    db.UserMembership.belongsTo(db.Membership);
    
    db.Membership.MatchDays = db.Membership.hasMany(db.MatchDay);
    db.MatchDay.belongsTo(db.Membership);

    // MatchDay 1:N associations...
    db.MatchDay.Boards = db.MatchDay.hasMany(db.Board);
    db.Board.belongsTo(db.MatchDay);

    db.Board.Matches = db.Board.hasMany(db.Match);
    db.Match.belongsTo(db.Board);
    
    db.Match.Champion = db.Match.belongsTo(db.User, {
        as: "champion"
    });
    
    db.Match.Challenger = db.Match.belongsTo(db.User, {
        as: "challenger"
    });

    db.Match.Result = db.Match.hasOne(db.Result);
    //db.Result.belongsTo(db.Match);

    db.Result.Winner = db.Result.belongsTo(db.User, {
        as: "winner"
    });

    db.Result.Loser = db.Result.belongsTo(db.User, {
        as: "loser"
    });
    // db.User.hasMany(db.Match);

    db.LoadDB = () => {
        return new Promise((resolve, reject) => {
            dbOptions.sequelize.sync()
            .then(() => {
                resolve(db);
            })
            .catch(error => {
                // Do the things...
                console.error('Unable to connect to the database:', error);
                reject(error);
            })
        })
    }
    return db;  
};