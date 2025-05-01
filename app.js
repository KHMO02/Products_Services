const express = require("express");
const app = express();
const productRoutes = require("./routes/productRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
app.use(express.json());
app.use(productRoutes);
app.use(analysisRoutes);

module.exports = app;
