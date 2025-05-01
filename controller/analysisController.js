const { Product, Account, ProductTransfer } = require("../models");
const productService = require("../services/productService");
exports.getAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const soldProducts = await productService.getSoldProducts(userId).length;
    const sellingProducts = await productService.getSellingProducts(userId)
      .length;
    const totalProducts = await productService.countUserProducts(userId);

    res.status(200).json({ totalProducts, soldProducts, sellingProducts });
  } catch (error) {
    console.error("Error fetching analysis data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
