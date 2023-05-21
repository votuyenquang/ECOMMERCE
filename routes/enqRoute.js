const express = require('express');


const  { authMiddleware , isAdmin } = require('../middelwares/authMiddelware');
const { 
        createEnquiry, 
        updateEnquiry, 
        deleteEnquiry,
        getaEnquiry,
        getAllEnquiry,
    } = require('../controller/enqController');
const router = express.Router();

router.post('/', authMiddleware,isAdmin, createEnquiry);
router.put('/:id', authMiddleware,isAdmin, updateEnquiry);
router.delete('/:id', authMiddleware,isAdmin, deleteEnquiry);
router.get('/:id',getaEnquiry);
router.get('/', getAllEnquiry)




module.exports = router;