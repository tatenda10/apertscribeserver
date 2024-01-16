const express = require('express');
const router = express.Router();
const {getPromotionStatus,updateDiscountForAllProducts} = require('../controllers/Products');

router.put('/', async (req, res) => {
    const { discountPercentage } = req.body;

    try {
        const result = await updateDiscountForAllProducts(discountPercentage);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating discount for all products:', error);
        res.status(500).json({ error: error.message });
    }
});


router.get('/', getPromotionStatus);



module.exports = router;
