const asyncHandler = require('express-async-handler')
const Color = require('../models/colorModel');
const validateMongodbId = require('../utils/validateMongodbId');

// create a new Color
const createColor = asyncHandler (async (req,res) => {

    try {
        const newColor = await Color.create(req.body);
        res.json(newColor);
    } catch (error) {
        throw new Error(error)
    }
});

// update the Color
const updateColor = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedColor = await Color.findByIdAndUpdate(id, req.body
        ,{new: true});
        res.json(updatedColor);
    } catch (error) {
        throw new Error(error)
    }
});
// delete the Color
const deleteColor = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deletedColor = await Color.findByIdAndDelete(id);
        res.json(deletedColor);
    } catch (error) {
        throw new Error (error);
    }
});

// get a Categorty
const getaColor = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const getaColor = await Color.findById(id);
        res.json(getaColor);
    } catch (error) {
        throw new Error(error);
    }
});

// get all Colors
const getAllColors = asyncHandler (async (req,res)=> {
    try {
        const getallColors = await Color.find();
        res.json(getallColors);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createColor,    
    updateColor,
    deleteColor,
    getaColor,
    getAllColors,
}
