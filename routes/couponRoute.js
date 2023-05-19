const express = require('express');
const { 
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon,
 } = require('../controller/couponController');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middelwares/authMiddelware')



router.post('/',authMiddleware , isAdmin, createCoupon );
router.get('/', authMiddleware, isAdmin, getAllCoupons);
router.put('/:id', authMiddleware, isAdmin, updateCoupon);
router.delete('/:id', authMiddleware, isAdmin, deleteCoupon);


module.exports = router;
