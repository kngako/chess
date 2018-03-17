module.exports = function (options) {
    var model = options.sequelize.define("matchDay", {
        id: {
            type: options.Sequelize.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true  
        },
        from: {
            type: options.Sequelize.DATE
        },
        until: {
            type: options.Sequelize.DATE
        },
        venue: {
            type: options.Sequelize.STRING
        }
    }, {
        comment: "Each defined Donation State in the system..."
    });

    return model;
};
