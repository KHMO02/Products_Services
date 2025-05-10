const { Product, Account, ProductTransfer } = require("../models");
const { Op } = require("sequelize");
const axios = require("axios");

module.exports = {
  async getProductById(id) {
    return await Product.findByPk(id);
  },

  async searchProducts(keyword) {
    console.info(`Searching for ${keyword}`);

    const soldProductIds = await ProductTransfer.findAll({
      attributes: ["product_id"],
      raw: true,
    });

    const soldIds = soldProductIds.map((p) => p.product_id);

    return await Product.findAll({
      where: {
        product_id: {
          [Op.notIn]: soldIds,
        },
        [Op.or]: [
          { name: { [Op.iLike]: `%${keyword}%` } },
          { description: { [Op.iLike]: `%${keyword}%` } },
        ],
      },
    });
  },

  async getSellingProducts(userId) {
    console.info("getSellingProducts with userId", userId);
    const soldProductIds = await ProductTransfer.findAll({
      attributes: ["product_id"],
      raw: true,
    });

    const soldIds = soldProductIds.map((p) => p.product_id);

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
    console.info("getSoldProducts with userId", userId);
    const soldProductIds = await ProductTransfer.findAll({
      where: { buyer_id: userId },
      attributes: ["product_id"],
      raw: true,
    });

    const soldIds = soldProductIds.map((p) => p.product_id);

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
    console.info("createProduct with userId", userId, "and data", data);
    return await Product.create({ ...data, creator_id: userId });
  },

  async updateProduct(id, userId, data) {
    console.info("updateProduct with id", id, "userId", userId, "and data", data);
    const product = await Product.findByPk(id);
    if (parseInt(product.creator_id) !== parseInt(userId)) throw new Error("Unauthorized");
    return await product.update(data);
  },

  async deleteProduct(id, userId) {
    console.info("deleteProduct with id", id, "and userId", userId);
    const product = await Product.findByPk(id);
    if (parseInt(product.creator_id) !== parseInt(userId)) throw new Error("Unauthorized");
    return await product.destroy();
  },

  async getPurchasedProducts(userId) {
    console.info("getPurchasedProducts with userId", userId);
    return await ProductTransfer.findAll({
      where: { buyer_id: userId },
      include: Product,
    });
  },

  async buyProduct(userId, productId) {
    console.info("buyProduct with userId", userId, "and productId", productId);
    const product = await Product.findByPk(productId);
    if (!product) throw new Error("Product not found");

    const alreadySold = await ProductTransfer.findOne({
      where: { product_id: productId },
    });
    if (alreadySold) throw new Error("Product already purchased");

    const buyerAccount = await Account.findByPk(userId);

    if (parseInt(buyerAccount.account_id) === parseInt(product.creator_id)) {
      throw new Error("You are the creator of this product!")
    }

    console.info(buyerAccount)
    if (!buyerAccount || parseInt(buyerAccount.balance) < parseInt(product.price)) {
        console.info(!buyerAccount)
        console.info(buyerAccount.balance < product.price)

        console.info("Insufficient balance");
        console.info(buyerAccount.balance)
        console.info(product.price)

      throw new Error("Insufficient balance");
    }

    await ProductTransfer.create({
      product_id: productId,
      buyer_id: userId,
      date_time: new Date(),
    });

    //Wallet Transfer Section
    // noinspection HttpUrlsUsage
    const response = await axios.post(
        `http://${process.env.E_WALLET_HOST}:${process.env.E_WALLET_PORT}/e-wallet/transfer`,
        {
          amount: parseInt(product.price),
          debit: parseInt(product.creator_id),
          credit: parseInt(userId)
        }
    );

    if (response.status !== 200) {
        console.error("Error transferring money:", response.data);
        throw new Error("Error transferring money");
    }
  },

  // TODO: deprecated
  async countUserProducts(userID) {
    console.info("countUserProducts with userID", userID);
    try {
      const productCount = await Product.count({
        where: {
          creator_id: userID,
        },
      });
      return productCount;
    } catch (error) {
      console.error("Error counting products:", error);
      throw error;
    }
  },


  // Purchased products
  async getPurchasedProductsCount(userId) {
    return await ProductTransfer.count({
      where: { buyer_id: userId },
    });
  },

  async getSoldProductsCount(userId) {
    console.info("getSoldProductsCount with userId", userId);
    const soldProductIds = await ProductTransfer.findAll({
      attributes: ["product_id"],
      raw: true,
    });

    const soldIds = soldProductIds.map((p) => p.product_id);

    return await Product.count({
      where: {
        creator_id: userId,
        product_id: {
          [Op.in]: soldIds,
        },
      },
    });
  },
  async getSellingProductsCount(userId) {
    console.info("getSellingProductsCount with userId", userId);
    const soldProductIds = await ProductTransfer.findAll({
      attributes: ["product_id"],
      raw: true,
    });

    const soldIds = soldProductIds.map((p) => p.product_id);

    return await Product.count({
      where: {
        creator_id: userId,
        product_id: {
          [Op.notIn]: soldIds,
        },
      },
    });
  },
};
