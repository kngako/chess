module.exports = function (options) {
    var model = options.sequelize.define("chessClub", {
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
        phoneNumber: {
            type: options.Sequelize.STRING
        },
        email: {
            type: options.Sequelize.STRING,
            validate: {
                isEmail: true
            }
        }
    });

    return model;
};

