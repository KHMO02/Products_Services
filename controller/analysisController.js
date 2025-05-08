const { Product, Account, ProductTransfer } = require("../models");
const productService = require("../services/productService");
exports.getAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;

    const soldProducts = await productService.getSoldProductsCount(userId);
    const sellingProducts = await productService.getSellingProductsCount(userId);
    const purchasedProducts = await productService.getPurchasedProductsCount(userId);
    // console.log("Sold products:", soldProducts);
    // console.log("Selling products:", sellingProducts);
    const totalProducts = soldProducts + sellingProducts + purchasedProducts;
    // console.log("Total products:", totalProducts);
    res.status(200).json({
      total_products: totalProducts,
      total_sold_products: soldProducts,
      total_purchased_products: purchasedProducts,
      total_selling_products: sellingProducts,
    });
  } catch (error) {
    console.error("Error fetching analysis data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
