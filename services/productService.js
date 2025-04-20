const { Product, Account, ProductTransfer } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async getProductById(id) {
    return await Product.findByPk(id);
  },

  async getSellingProducts(userId) {
    const soldProductIds = await ProductTransfer.findAll({
      attributes: ['product_id'],
      raw: true,
    });
  
    const soldIds = soldProductIds.map(p => p.product_id);
  
    return await Product.findAll({
      where: {
        creator_id: userId,
        product_id: {
          [Op.notIn]: soldIds,
        },
      },
    });
  },

  async getSoldProducts(userId) {
    const soldProductIds = await ProductTransfer.findAll({
      where: { buyer_id: userId },
      attributes: ['product_id'],
      raw: true,
    });
  
    const soldIds = soldProductIds.map(p => p.product_id);
  
    return await Product.findAll({
      where: {
        creator_id: userId,
        product_id: {
          [Op.in]: soldIds,
        },
      },
    });
  },

  async createProduct(data) {
    return await Product.create(data);
  },

  async updateProduct(id, userId, data) {
    const product = await Product.findByPk(id);
    if (product.creator_id !== userId) throw new Error('Unauthorized');
    return await product.update(data);
  },

  async deleteProduct(id, userId) {
    const product = await Product.findByPk(id);
    if (product.creator_id !== userId) throw new Error('Unauthorized');
    return await product.destroy();
  },

  async getPurchasedProducts(userId) {
    return await ProductTransfer.findAll({
      where: { buyer_id: userId },
      include: Product,
    });
  },
};