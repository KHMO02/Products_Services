module.exports = (sequelize, DataTypes) => {
    const Account = sequelize.define('Account', {
      account_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      email: DataTypes.STRING,
      password_hash: DataTypes.STRING,
      balance: DataTypes.DECIMAL(10, 2),
    }, {
      tableName: 'account',
      timestamps: false,
    });
  
    Account.associate = (models) => {
      Account.hasMany(models.Product, { foreignKey: 'creator_id' });
      Account.hasMany(models.ProductTransfer, { foreignKey: 'buyer_id' });
    };
  
    return Account;
  };