var config = require("config");
var dbUtils = require("./persistence")(config);

dbUtils.LoadDB().then(db => {
    // TODO: work with the db...
}).catch(error => {
    // TODO: handle the error...
    console.error("Error not handled: ", error)
})