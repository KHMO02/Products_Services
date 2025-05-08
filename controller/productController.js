const productService = require("../services/productService");

function mapApiToDbProduct(data) {
  return {
    name: data.name,
    description: data.description,
    price: data.price,
    picture_url: data.picture_url,
    on_sale: true, // or default true/false — depends on your app logic
  };
}

module.exports = {
  async getProductById(req, res) {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  },

  async searchProducts(req, res) {
    const keyword = req.query.q || "";
    const products = await productService.searchProducts(keyword);
    res.json(products);
  },

  async getSellingProducts(req, res) {
    const products = await productService.getSellingProducts(req.user.id);
    res.json(products);
  },

  async getSoldProducts(req, res) {
    const soldProducts = await productService.getSoldProducts(req.user.id);
    res.json(soldProducts);
  },

  async createProduct(req, res) {
    const newProduct = await productService.createProduct(
      req.user.id,
      mapApiToDbProduct(req.body)
    );
    res.status(201).json(newProduct);
  },

  async updateProduct(req, res) {
    try {
      const updated = await productService.updateProduct(
        req.params.id,
        req.user.id,
        mapApiToDbProduct(req.body)
      );
      res.json(updated);
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  },

  async deleteProduct(req, res) {
    try {
      await productService.deleteProduct(req.params.id, req.user.id);
      res.status(204).send();
    } catch (err) {
      res.status(403).json({ error: err.message });
    }
  },

  async getPurchasedProducts(req, res) {
    const transfers = await productService.getPurchasedProducts(req.user.id);
    res.json(transfers);
  },

  async buyProduct(req, res) {
    try {
      const result = await productService.buyProduct(
        req.user.id,
        parseInt(req.params.id)
      );
      res.status(200).json({ message: "Product transferred", ...result });
    } catch (err) {
      console.error(err)
      if (err.message === "Product already purchased") {
        return res.status(409).json({ error: err.message });
      } else if (err.message === "Insufficient balance") {
        return res.status(406).json({ error: err.message });
      } else if (err.message === "Product not found") {
        return res.status(404).json({ error: err.message });
      } else {
        return res.status(500).json({ error: "Something went wrong" });
      }
    }
  },
};
