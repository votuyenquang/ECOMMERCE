const asyncHandler = require('express-async-handler')
const BlogCategory = require('../models/blogCatModel');
const validateMongodbId = require('../utils/validateMongodbId');

// create a new category
const createBlogCategory = asyncHandler (async (req,res) => {

    try {
        const newBlogCategory = await BlogCategory.create(req.body);
        res.json(newBlogCategory);
    } catch (error) {
        throw new Error(error)
    }
});

// update the category
const updateBlogCategory = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedBlogCategory = await BlogCategory.findByIdAndUpdate(id, req.body
        ,{new: true});
        res.json(updatedBlogCategory);
    } catch (error) {
        throw new Error(error)
    }
});
// delete the category
const deleteBlogCategory = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deletedBlogCategory = await BlogCategory.findByIdAndDelete(id);
        res.json(deletedBlogCategory);
    } catch (error) {
        throw new Error (error);
    }
});

// get a Categorty
const getaBlogCategory = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const getaBlogCategory = await BlogCategory.findById(id);
        res.json(getaBlogCategory);
    } catch (error) {
        throw new Error(error);
    }
});

// get all categories
const getAllBlogCategories = asyncHandler (async (req,res)=> {
    try {
        const getallBlogCategories = await BlogCategory.find();
        res.json(getallBlogCategories);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createBlogCategory,    
    updateBlogCategory ,
    deleteBlogCategory,
    getaBlogCategory ,
    getAllBlogCategories,
}
