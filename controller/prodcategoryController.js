const asyncHandler = require('express-async-handler')
const Category = require('../models/prodcategoryModel');
const validateMongodbId = require('../utils/validateMongodbId');

// create a new category
const createCategory = asyncHandler (async (req,res) => {

    try {
        const newCategory = await Category.create(req.body);
        res.json(newCategory);
    } catch (error) {
        throw new Error(error)
    }
});

// update the category
const updateCategory = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body
        ,{new: true});
        res.json(updatedCategory);
    } catch (error) {
        throw new Error(error)
    }
});
// delete the category
const deleteCategory = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        res.json(deletedCategory);
    } catch (error) {
        throw new Error (error);
    }
});

// get a Categorty
const getaCategory = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const getaCategory = await Category.findById(id);
        res.json(getaCategory);
    } catch (error) {
        throw new Error(error);
    }
});

// get all categories
const getAllCategories = asyncHandler (async (req,res)=> {
    try {
        const getallCategories = await Category.find();
        res.json(getallCategories);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createCategory,    
    updateCategory,
    deleteCategory,
    getaCategory,
    getAllCategories,
}
