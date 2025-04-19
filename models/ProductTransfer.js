module.exports = (sequelize, DataTypes) => {
    const ProductTransfer = sequelize.define('ProductTransfer', {
      date_time: DataTypes.DATE,
      buyer_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    }, {
      tableName: 'product_transfer',
      timestamps: false,
    });
  
    ProductTransfer.associate = (models) => {
      ProductTransfer.belongsTo(models.Account, { foreignKey: 'buyer_id' });
      ProductTransfer.belongsTo(models.Product, { foreignKey: 'product_id' });
    };
  
    return ProductTransfer;
  };