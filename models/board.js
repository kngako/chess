module.exports = function (options) {
    var model = options.sequelize.define("board",{
        id: {
            type: options.Sequelize.BIGINT,
            primaryKey: true,
            unique: true,
            autoIncrement: true  
        },
        name: {
            type: options.Sequelize.STRING
        },
        duration: {
            type: options.Sequelize.BIGINT // TODO: Use integer...
        }
    });

    return model;
};
