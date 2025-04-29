const { Product, Account, ProductTransfer } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async getProductById(id) {
    return await Product.findByPk(id);
  },

  async searchProducts(keyword) {
    return await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${keyword}%` } },
          { description: { [Op.iLike]: `%${keyword}%` } },
        ],
      },
    });
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

  async createProduct(userId, data) {
    return await Product.create({...data, creator_id: userId});
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

  async buyProduct(userId, productId) {
    const product = await Product.findByPk(productId);
    if (!product) throw new Error('Product not found');
  
    const alreadySold = await ProductTransfer.findOne({ where: { product_id: productId } });
    if (alreadySold) throw new Error('Product already purchased');
  
    const buyerAccount = await Account.findByPk(userId);
    if (!buyerAccount || buyerAccount.balance < product.price) {
      throw new Error('Insufficient balance');
    }
  
    await ProductTransfer.create({
      product_id: productId,
      buyer_id: userId,
      transfer_date: new Date()
    });
    

    //Wallet Transfer Section (Handled Later)
    // buyerAccount.balance -= product.price;
    // await buyerAccount.save();
    // return { session_id: `mock-session-${Date.now()}` };
  },
  
};