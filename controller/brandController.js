const asyncHandler = require('express-async-handler')
const Brand = require('../models/brandModel');
const validateMongodbId = require('../utils/validateMongodbId');

// create a new Brand
const createBrand = asyncHandler (async (req,res) => {

    try {
        const newBrand = await Brand.create(req.body);
        res.json(newBrand);
    } catch (error) {
        throw new Error(error)
    }
});

// update the Brand
const updateBrand = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedBrand = await Brand.findByIdAndUpdate(id, req.body
        ,{new: true});
        res.json(updatedBrand);
    } catch (error) {
        throw new Error(error)
    }
});
// delete the Brand
const deleteBrand = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deletedBrand = await Brand.findByIdAndDelete(id);
        res.json(deletedBrand);
    } catch (error) {
        throw new Error (error);
    }
});

// get a Categorty
const getaBrand = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const getaBrand = await Brand.findById(id);
        res.json(getaBrand);
    } catch (error) {
        throw new Error(error);
    }
});

// get all Brands
const getAllBrands = asyncHandler (async (req,res)=> {
    try {
        const getallBrands = await Brand.find();
        res.json(getallBrands);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createBrand,    
    updateBrand,
    deleteBrand,
    getaBrand,
    getAllBrands,
}
