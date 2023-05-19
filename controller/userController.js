const User = require('../models/userModel');
const asyncHandler = require('express-async-handler')
const { generateToken }= require('../config/jwtToken');
const validateMongodbId = require('../utils/validateMongodbId');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('./emailController');

// create user / register
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    console.log(email);
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
};
