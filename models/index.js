const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config');

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Account = require('./Account')(sequelize, DataTypes);
db.Product = require('./Product')(sequelize, DataTypes);
db.ProductTransfer = require('./ProductTransfer')(sequelize, DataTypes);

Object.values(db).forEach((model) => {
  if (model.associate) model.associate(db);
});

module.exports = db;