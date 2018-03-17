module.exports = function (options) {
    var model = options.sequelize.define("player", {
        id: {
            type: options.Sequelize.BIGINT,
            primaryKey: true,
            unique: true,
            autoIncrement: true  
        }
        
    }, {
        comment: "A player in a match..."
    });

    return model;
};
