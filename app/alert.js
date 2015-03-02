var Sequelize = require('Sequelize');

module.exports = function (sequelize) {
	var Alert = sequelize.define('Alert', {
        createdAt: Sequelize.DATE,
        email: Sequelize.STRING,
        business_id: Sequelize.STRING(30),
        business_name: Sequelize.STRING,
        type: Sequelize.ENUM('all','score','critical'),
        value: Sequelize.STRING,
        lastTriggeredAt: Sequelize.DATE

    }, {
        tableName: 'alerts',
        timestamps: false
    });

    return Alert;
};