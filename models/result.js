module.exports = function (options) {
    var model = options.sequelize.define("result", {
        id: {
            type: options.Sequelize.BIGINT,
            primaryKey: true,
            unique: true,
            autoIncrement: true  
        },
        isDraw: {
            type: options.Sequelize.DATE
        },
        comment: {
            type: options.Sequelize.STRING,
        }
    });

    return model;
};
