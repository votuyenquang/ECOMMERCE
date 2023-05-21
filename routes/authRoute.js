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
    resetPassword,
    loginAdmin,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus
} = require('../controller/userController'); 
const { authMiddleware , isAdmin } = require('../middelwares/authMiddelware');

router.post('/register', createUser);
router.post('/forgot-password-token',forgotPasswordToken)
router.put('/reset-password/:token',resetPassword)
router.put('/order/update-order/:id',authMiddleware, isAdmin,updateOrderStatus)

router.put('/password', authMiddleware, updatePassword);
router.post('/login',loginUser);
router.post('/login-admin',loginAdmin);
router.post('/cart/applycoupon',authMiddleware,applyCoupon);
router.post('/cart/cash-order',authMiddleware, createOrder);
router.post('/cart',authMiddleware, userCart);

router.get('/refresh',handleRefreshToken);
router.get('/logout', logout)
router.get('/get-orders', authMiddleware, getOrders);
router.get('/all-users',getAllUsers);
router.get('/wishlist',authMiddleware, getWishlist);
router.get('/cart',authMiddleware, getUserCart);



router.delete('/empty-cart',authMiddleware, emptyCart);
router.get('/:id',authMiddleware,isAdmin, getaUser);
router.delete('/:id',deleteaUser);

router.put('/edit-user',authMiddleware,updatedaUser);
router.put('/save-address',authMiddleware, saveAddress);
router.put('/block-user/:id',authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id',authMiddleware, isAdmin, unblockUser);





module.exports = router;
