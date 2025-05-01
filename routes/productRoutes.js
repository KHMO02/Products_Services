const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
const axios = require("axios");

exports.authenticate = async function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Missing or invalid Bearer token" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token

  try {
    // noinspection HttpUrlsUsage
    const response = await axios.post(
      `http://${process.env.AUTH_HOST}:${process.env.AUTH_PORT}/auth/verify-token`,
      { token }
    ); // Adjust the endpoint and request body as needed

    if (response.data && response.data.valid) {
      req.user = { id: response.data.user };
      next();
    } else {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  } catch (error) {
    console.error("Error communicating with auth service:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error: Authentication failed" });
  }
};

const validateIntegerId = (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID. Must be an integer." });
  }

  req.params.id = id;
  next();
};

router.get(
  "/products/selling",
  authenticate,
  productController.getSellingProducts
);
router.get("/products", productController.searchProducts);
router.get("/products/sold", authenticate, productController.getSoldProducts);
router.post("/products/selling", authenticate, productController.createProduct);
router.put(
  "/products/:id",
  validateIntegerId,
  authenticate,
  productController.updateProduct
);
router.delete(
  "/products/:id",
  validateIntegerId,
  authenticate,
  productController.deleteProduct
);
router.get(
  "/products/purchased",
  authenticate,
  productController.getPurchasedProducts
);
router.get(
  "/products/:id",
  validateIntegerId,
  productController.getProductById
);
router.post(
  "/products/buy/:id",
  validateIntegerId,
  authenticate,
  productController.buyProduct
);

module.exports = router;
