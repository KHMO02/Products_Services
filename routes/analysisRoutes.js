const express = require("express");
const router = express.Router();
const authController = require("./productRoutes");
const analysisController = require("../controller/analysisController");

router.use(authController.authenticate);

router.get("/analysis", analysisController.getAnalysis);

module.exports = router;
