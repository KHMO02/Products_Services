module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
      product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      price: DataTypes.DECIMAL(10, 2),
      on_sale: DataTypes.BOOLEAN,
      creator_id: DataTypes.INTEGER,
    }, {
      tableName: 'product',
      timestamps: false,
    });
  
    Product.associate = (models) => {
      Product.belongsTo(models.Account, { foreignKey: 'creator_id' });
      Product.hasMany(models.ProductTransfer, { foreignKey: 'product_id' });
    };
  
    return Product;
  };