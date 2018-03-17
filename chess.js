var config = require("config");
var dbUtils = require("./persistence")(config);

dbUtils.LoadDB().then(db => {
    // TODO: work with the db...
    var router = require('./router.js')(config, db);
    // TODO: set the extra things on the routers...
}).catch(error => {
    // TODO: handle the error...
    console.error("Error not handled: ", error)
})