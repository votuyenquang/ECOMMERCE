const express = require('express');


const  { authMiddleware , isAdmin } = require('../middelwares/authMiddelware');
const { 
        createColor, 
        updateColor, 
        deleteColor,
        getaColor,
        getAllColors,
    } = require('../controller/colorController');
const router = express.Router();

router.post('/', authMiddleware,isAdmin, createColor);
router.put('/:id', authMiddleware,isAdmin, updateColor);
router.delete('/:id', authMiddleware,isAdmin, deleteColor);
router.get('/:id',getaColor);
router.get('/', getAllColors)




module.exports = router;