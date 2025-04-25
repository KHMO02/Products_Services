const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');


router.use((req, res, next) => {
  req.user = { id: 1 }; // mocked user
  next();
});

router.get('/products/:id', productController.getProductById);
router.get('/products/selling', productController.getSellingProducts);
router.get('/products/sold', productController.getSoldProducts);
router.post('/products/selling', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
router.get('/products/purchased', productController.getPurchasedProducts);

module.exports = router;