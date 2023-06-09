const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');

const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uniqid = require('uniqid');

const { generateToken }= require('../config/jwtToken');
const validateMongodbId = require('../utils/validateMongodbId');
const { generateRefreshToken } = require('../config/refreshToken');
const sendEmail = require('./emailController');

// create user / register
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;

    const findUser = await User.findOne({ email });

    if(!findUser){
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
        throw new Error('User already exists');
    }
});

// login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    // check if user already exists or not
    const findUser = await User.findOne({ email });
    if (findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateuser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken,
            },
            {
                new: true,
            });
        res.cookie('refreshToken', refreshToken,{
            httpOnly: true,
            maxAge: 72 * 60 * 60 *1000
        })
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),

        });
    } else {
    res.status(401);
    throw new Error('Invalid Credentials');
    }
});


// login Admin
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    // check if user already exists or not
    const findAdmin = await User.findOne({ email });
    if(findAdmin.role !== 'admin') throw new Error ('Not Authorised');
    if (findAdmin && await findAdmin.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const updateuser = await User.findByIdAndUpdate(
            findAdmin.id,
            {
                refreshToken,
            },
            {
                new: true,
            });
        res.cookie('refreshToken', refreshToken,{
            httpOnly: true,
            maxAge: 72 * 60 * 60 *1000
        })
        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id),

        });
    } else {
    res.status(401);
    throw new Error('Invalid Credentials');
    }
});

// handle refresh token
const handleRefreshToken = asyncHandler (async (req, res) => {
    const cookie = req.cookies;
    
    if (!cookie?.refreshToken) throw new Error('No Refresh token in Cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if (!user) throw new Error('No Refresh token in db or not matched');
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
       if (err || user.id !== decoded.id){
        throw new Error('There is something wrong with refresh token');
       }
       const accessToken = generateToken(user?._id);
       res.json({ accessToken })
    });
});

//logout function
const logout = asyncHandler (async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error('No Refresh token in Cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if (!user) {
        res.clearCookie('refreshToken',{
            httpOnly: true,
            secure:true,
        });
        return res.sendStatus(204) // forbidden

            }

    await User.findOneAndUpdate( {refreshToken} , {
                 refreshToken: "",
            });
    res.clearCookie('refreshToken',{
            httpOnly: true,
            secure:true,
        });
    return res.sendStatus(204) // forbidden
    
});

// update a user
const updatedaUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const updatedaUser = await User.findByIdAndUpdate(
        _id,
        {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile,
                       
        },
        {
            new: true,
        });
        res.json( updatedaUser)
    } catch (error) {
        throw new Error (error)
    }
});

//save user Address

const saveAddress = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const updatedaUser = await User.findByIdAndUpdate(_id,
            {
                address: req?.body?.address,
            },
            {
                new: true,
            });
            res.json( updatedaUser)
    } catch (error) {
        throw new Error (error);
    }
});


// get all users 
const getAllUsers = asyncHandler(async (req,res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);       
    } catch (error) {
        throw new Error(error)
    }
});

// get a single user
const getaUser = asyncHandler(async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);

    try {
        const getaUser = await User.findById( id);
        res.json({
            getaUser,
        });
    } catch (error) {
        throw new Error(error);
    }
});

// delete a single user
const deleteaUser = asyncHandler(async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);

    try {
        const deleteaUser = await User.findByIdAndDelete( id);
        res.json({
            deleteaUser,
        });
    } catch (error) {
        throw new Error(error);
    }
});

const blockUser = asyncHandler(async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);

    try {
        const blockUser = await User.findByIdAndUpdate( id, {
            isBlocked: true,
        },
        {
            new: true,
        });
        res.json({
            message : 'User Blocked',
        })
    } catch (error) {
        throw new Error(error);
    }
});
const unblockUser = asyncHandler(async (req,res) =>{
    const { id } = req.params;
    validateMongodbId(id);

    try {
        const blockUser = await User.findByIdAndUpdate( id, {
            isBlocked: false,
        },
        {
            new: true,
        });
        res.json({
            message : 'User Unlocked',
        })
    } catch (error) {
        throw new Error(error);
    }
});

const updatePassword = asyncHandler(async (req,res) =>{
    const { _id } = req.user;
    const { password }= req.body;
    validateMongodbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    } else {
        res.json(user);
    }
});

const forgotPasswordToken = asyncHandler(async (req,res) =>{
    const { email } = req.body;
    console.log({ email });
    const user = await User.findOne({ email });
    if (!user) throw new Error ('User not found with this email');
    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetUrl = `Hi, please follow this link to reset your password. this link is valid till 10 mins from now. <a href= 'http://localhost:4000/api/user/reset-password/${token} '>Click</a>  `
        const data = {
            to: email,
            text: "Hey user",
            subject: 'Forgot Password Link',
            htm: resetUrl,
        };
        sendEmail(data);
        res.json(token);
       
    } catch (error) {
        throw new Error (error);
    }
});

// reset password
const resetPassword = asyncHandler (async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() } 
    });
    if (!user) {
            throw new Error('Token expired, please try again later');
        }
    user.password = password;
    user.passwordResetToken= undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);

});


const getWishlist = asyncHandler (async (req, res) => {
    const { _id} = req.user;
    validateMongodbId(_id);
    try {
        const findUser = await User.findById( _id ).populate('wishlist');
        res.json(findUser);
    } catch (error) {
        throw new Error(error)
    }
});

const userCart = asyncHandler (async (req, res,next) => {
    const {cart  } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        let products = [];
        const user = await User.findById(_id);
        //check if user already have product in cart
        const alreadyExistCart = await Cart.findOne({ orderby : user._id});
        if (alreadyExistCart) {
         alreadyExistCart.remove();
         
        }
        for (let i= 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select("price").exec();
            object.price = getPrice.price;
            products.push(object);
        }
       let cartTotal =  0;
       for (let i= 0; i < products.length; i++) {
           cartTotal += products[i].price * products[i].count;
       }
       console.log(products, cartTotal);
       let newCart = await new Cart({
        products,
        cartTotal,
        orderby: user?._id,
       }).save();
       res.json(newCart);
    } catch (error) {
        throw new Error(error);
    }

});

const getUserCart = asyncHandler(async (req,res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const cart = await Cart.findOne({orderby: _id}).populate(
            "products.product",
        );
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});
const emptyCart = asyncHandler(async (req,res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const user = await User.findOne({_id});
        const cart = await Cart.findOneAndRemove({ orderby: user._id });
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});

const applyCoupon = asyncHandler(async (req,res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);
    const validCoupon = await Coupon.findOne({ name: coupon });
    
    if(validCoupon === null) {
        throw new Error('Invalid coupon');
    }
    const user = await User.findOne({_id});
    let { cartTotal} = await Cart.findOne({ orderby: user._id }).populate(
        "products.product",
    );
    let totalAfterDiscount = (cartTotal - ( cartTotal * validCoupon.discount )/100).toFixed(2);
    await Cart.findOneAndUpdate({ orderby: user._id}, {totalAfterDiscount}, {new :true});
    res.json(totalAfterDiscount);
});

const createOrder = asyncHandler( async(req, res) => {
    const { COD , couponApplied } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        if (!COD) throw new Error("Create cash order failed");
        const user = await User.findById(_id);
        let userCart = await Cart.findOne({ orderby: user._id });
        let finalAmount = 0;
        if (couponApplied && userCart.totalAfterDiscount) {
                    finalAmount = userCart.totalAfterDiscount ;
                } else {
                    finalAmount = userCart.cartTotal ;
                }

        let newOrder = await new Order({
            products : userCart.products,
            paymentIntent : {
                id : uniqid(),
                method: 'COD',
                amount: finalAmount,
                status : 'Cash on Delivery',
                created: Date.now(),
                currency : 'usd',
            },
            orderby: user._id,
            orderStatus: 'Cash on Delivery',
        }).save();
        let update =  userCart.products.map( (item) => {
            return {
                updateOne : {
                    filter: { _id: item.product._id },
                    update: { $inc : {quantity : -item.count, sold: +item.count } },
                },
            };
        });
        const updated = await Product.bulkWrite(update, {});
        res.json( {
            message: "success"
        })
    } catch (error) {
        throw new Error(error);
    }
});

const getOrders = asyncHandler (async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const userorders = await Order.findOne( { orderby: _id }).populate('products.product').exec();
        res.json(userorders);
    } catch (error) {
        throw new Error(error);
    }
})

const updateOrderStatus = asyncHandler (async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updateOrderStt = await Order.findByIdAndUpdate(id, 
            {
                orderStatus: status,
                paymentIntent: {
                    status : status,
                }
            },
            {
                new: true,
            });
        res.json(updateOrderStt);
    } catch (error) {
        throw new Error(error);
    }
});


module.exports = {
    createUser,
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
    updateOrderStatus,
};
