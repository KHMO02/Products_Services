const express = require("express");
const app = express();
const { router: productRoutes } = require("./routes/productRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
app.use(express.json());
app.use(analysisRoutes);
app.use(productRoutes);

module.exports = app;
