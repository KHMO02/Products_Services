const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config');

const sequelize = new Sequelize(config);

const db = {};

db.sequelize = sequelize;

db.Account = require('./Accounts')(sequelize, DataTypes);
db.Product = require('./Product')(sequelize, DataTypes);
db.ProductTransfer = require('./ProductTransfer')(sequelize, DataTypes);

Object.values(db).forEach((model) => {
  if (model.associate) model.associate(db);
});

module.exports = db;