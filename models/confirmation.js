module.exports = function (options) {
    var model = options.sequelize.define("confirmation", {
        token: {
            type: options.Sequelize.UUID,
            defaultValue: options.Sequelize.UUIDV1,
            primaryKey: true,
            unique: true
        },
        sent: {
            type: options.Sequelize.INTEGER
        }
    }, {
        comment: "User confirmation"
    });

    return model;
};