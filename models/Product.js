module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
      product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      picture_url: DataTypes.STRING,
      description: DataTypes.TEXT,
      price: DataTypes.DECIMAL(10, 2),
      on_sale: DataTypes.BOOLEAN,
      creator_id: DataTypes.INTEGER,
    }, {
      tableName: 'product',
      timestamps: false,
    });

    Product.prototype.toJSON = function () {
        return {
            id: this.product_id,
            name: this.name,
            price: parseFloat(this.price),
            picture_url: this.picture_url,
            description: this.description,
        };
    };

    Product.associate = (models) => {
      Product.belongsTo(models.Account, { foreignKey: 'creator_id' });
      Product.hasMany(models.ProductTransfer, { foreignKey: 'product_id' });
    };
  
    return Product;
  };