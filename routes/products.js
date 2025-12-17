const express = require('express');
const router = express.Router();
const { getProducts, getStats } = require('../controllers/product.controller');


router.get('/', getProducts);


//  route pour les statistiques (phase 3 )
router.get('/stats', getStats);

module.exports = router;
