module.exports = function (options) {
    var model = options.sequelize.define("match", {
        id: {
            type: options.Sequelize.BIGINT,
            primaryKey: true,
            unique: true,
            autoIncrement: true  
        },
        time: {
            type: options.Sequelize.DATE
        }
    });

    return model;
};
