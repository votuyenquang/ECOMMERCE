const asyncHandler = require('express-async-handler')
const Enquiry = require('../models/enqModel');
const validateMongodbId = require('../utils/validateMongodbId');

// create a new Enquiry
const createEnquiry = asyncHandler (async (req,res) => {

    try {
        const newEnquiry = await Enquiry.create(req.body);
        res.json(newEnquiry);
    } catch (error) {
        throw new Error(error)
    }
});

// update the Enquiry
const updateEnquiry = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedEnquiry = await Enquiry.findByIdAndUpdate(id, req.body
        ,{new: true});
        res.json(updatedEnquiry);
    } catch (error) {
        throw new Error(error)
    }
});
// delete the Enquiry
const deleteEnquiry = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deletedEnquiry = await Enquiry.findByIdAndDelete(id);
        res.json(deletedEnquiry);
    } catch (error) {
        throw new Error (error);
    }
});

// get a Categorty
const getaEnquiry = asyncHandler (async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const getaEnquiry = await Enquiry.findById(id);
        res.json(getaEnquiry);
    } catch (error) {
        throw new Error(error);
    }
});

// get all Enquirys
const getAllEnquiry = asyncHandler (async (req,res)=> {
    try {
        const getallEnquiry = await Enquiry.find();
        res.json(getallEnquiry);
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createEnquiry,    
    updateEnquiry,
    deleteEnquiry,
    getaEnquiry,
    getAllEnquiry,
}
