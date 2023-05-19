const express = require('express');


const  { authMiddleware , isAdmin } = require('../middelwares/authMiddelware');
const { 
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory,
    getaBlogCategory,
    getAllBlogCategories,

  } = require('../controller/blogCatController');
const router = express.Router();

router.post('/', authMiddleware,isAdmin, createBlogCategory);
router.put('/:id', authMiddleware,isAdmin, updateBlogCategory );
router.delete('/:id', authMiddleware,isAdmin, deleteBlogCategory);
router.get('/:id',getaBlogCategory);
router.get('/', getAllBlogCategories)




module.exports = router;