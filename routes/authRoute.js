const express = require('express');
const router = express.Router();
const { 
    createUser ,
    loginUser, 
    getAllUsers, 
    getaUser, 
    deleteaUser,
    updatedaUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout, 
    updatePassword,
    forgotPasswordToken,
    resetPassword
} = require('../controller/userController'); 
const { authMiddleware , isAdmin } = require('../middelwares/authMiddelware');

router.post('/register', createUser);
router.post('/forgot-password-token',forgotPasswordToken)
router.put('/reset-password/:token',resetPassword)

router.put('/password', authMiddleware, updatePassword);
router.post('/login',loginUser);
router.get('/refresh',handleRefreshToken);
router.get('/logout', logout)
router.get('/all-users',getAllUsers);
router.get('/:id',authMiddleware,isAdmin, getaUser);
router.delete('/:id',deleteaUser);
router.put('/edit-user',authMiddleware,updatedaUser);
router.put('/block-user/:id',authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id',authMiddleware, isAdmin, unblockUser);





module.exports = router;
