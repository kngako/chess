module.exports = function (options) {
    var model = options.sequelize.define("membership", {
        id: {
            type: options.Sequelize.BIGINT,
            primaryKey: true,
            unique: true,
            autoIncrement: true  
        },
        name: {
            type: options.Sequelize.STRING
        },
        description: {
            type: options.Sequelize.TEXT
        },
    }, {
        comment: "A membership a user belongs to..."
    });    

    model.isHierarchy();

    return model;
};

