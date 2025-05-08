const express = require("express");
const router = express.Router();
const { authenticate } = require("./productRoutes");
const analysisController = require("../controller/analysisController");

router.get("/products/analytics", authenticate, analysisController.getAnalysis);

module.exports = router;
