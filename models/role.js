module.exports = function (options) {
    var model = options.sequelize.define("role", {
        id: {
            type: options.Sequelize.BIGINT,
            primaryKey: true,
            unique: true,
            autoIncrement: true  
        },
        description: {
            type: options.Sequelize.STRING
        },
        type: {
            type: options.Sequelize.STRING
        }
    }, {
        comment: "Each defined role in the system..."
    });

    return model;
};