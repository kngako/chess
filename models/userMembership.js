module.exports = function (options) {
    var model = options.sequelize.define("userMembership", {
        // Attributes...
        id: {
            type: options.Sequelize.BIGINT,
            primaryKey: true,
            unique: true,
            autoIncrement: true  
        }
    });

    return model;
};