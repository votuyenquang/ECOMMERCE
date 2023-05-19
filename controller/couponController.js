const Coupon = require('../models/couponModel');
const validateMongodbId = require('../utils/validateMongodbId');
const asyncHandler = require('express-async-handler');

// create new Coupon
const createCoupon = asyncHandler(async (req, res) => {
    try {
        const newCoupon = await Coupon.create( req.body);
        res.json(newCoupon);
    } catch (error) {
        throw new Error(error)
    }
});

// get all Coupons

const getAllCoupons = asyncHandler(async (req, res) => {
    try {
        const getallCoupons = await Coupon.find();
        res.json(getallCoupons);
    } catch (error) {
        throw new Error(error)
    }
});

// update a coupon
const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body,
            {
                new : true,
            });
            res.json(updatedCoupon);
    } catch (error) {
        throw new Error(error);
    }
});

// delete a coupon
const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        res.json(deletedCoupon);
    } catch (error) {
        throw new Error(error);
    }
});







module.exports = {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon,
    
}
