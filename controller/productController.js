const Product = require('../models/productModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const validateMongodbId = require('../utils/validateMongodbId');
const  { cloudinaryUploadImg , cloudinaryDeleteImg } = require('../utils/cloudinary'); 
const fs = require('fs');

// create product
const createProduct = asyncHandler(async (req,res)=> {
    try {
        if (req.body.title){
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    
    } catch (error) {
        throw new Error (error)   ; 
    }
});

// update product
const updateProduct = asyncHandler(async (req,res)=> {
    const id = req.params.id;
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updateProduct = await Product.findOneAndUpdate( {_id : id}, req.body,  {
            new: true,
        },  );
        res.json(updateProduct);
        
    } catch (error) {
        throw new Error (error) ;
    }
});

// delete product 
const deleteProduct = asyncHandler(async (req,res)=> {
    const id = req.params.id;
    try {
        const deleteProduct = await Product.findByIdAndDelete(id);
        res.json(deleteProduct);
        
    } catch (error) {
        throw new Error (error) ;
    }
});


// get a  product 
const getaProduct = asyncHandler(async (req,res)=> {
    const {id} = req.params;
    try {
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    } catch (error) {
        throw new Error (error) ;
    }
});

// get all product
const getAllProducts = asyncHandler(async (req,res)=> {
    try {
        // Fillter
        const queryObj = { ...req.query };
        const excludeFields = [ 'page', 'sort', 'limit', 'fields'];
        excludeFields.forEach((el) => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr= queryStr.replace(/\b(gte|gt|lte)\b/g, (match) => `$${match}`);

        let query = Product.find(JSON.parse(queryStr));

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy)
                    
        } else {
            query = query.sort('-createdAt');
            }

        // Limiting the Fields
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);

        } else {
            query = query.select('-__v');
        }

        // Pagination

        const page = req.query.page;
        const limit = req.query.limit;
        const skip = limit * (page - 1);
        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount) throw new Error ('This Page does not exist');
        }
        
        
        
        const product = await query;
        res.json(product);
    } catch (error) {
        throw new Error (error) ;
    }
});

//add to wishlist 
const addToWishlist = asyncHandler(async (req,res)=> {
    const { _id } = req.user;
    const { prodId } = req.body;
    try {
        const user = await User.findById(_id);
        const alreadyAdd=  user.wishlist.find((id) => id.toString() === prodId );
        if (alreadyAdd) {
            let user = await User.findByIdAndUpdate(_id, {
                $pull : { wishlist : prodId}
            }, {
                new: true,
            }
                );
                res.json(user);
        } else {
            let user = await User.findByIdAndUpdate(_id, {
                $push : { wishlist : prodId}
            }, {
                new: true,
            }
                );
                res.json(user);
        }
    } catch (error) {
        throw new Error(error)
    }
});

// rating
const rating = asyncHandler( async(req, res) => {
    const { _id } = req.user;
    const { star, prodId, comment } = req.body;
    try {
        const product = await Product.findById(prodId);
        let alreadyRated = product.ratings.find(
            (userId) => userId.postedby.toString() === _id.toString());
            if (alreadyRated) {
                const updateRating = await Product.updateOne(
                    {
                        ratings :{ $elemMatch : alreadyRated},
                    },
                    {
                        $set : { "ratings.$.star": star, "ratings.$.comment": comment},
                    },
                    { new : true },
                );

            } else {
                const rateProduct = await Product.findByIdAndUpdate(prodId,
                    {
                        $push: {
                            ratings: {
                                postedby: _id,
                                comment: comment,
                                star: star,
                            },
                         },
                    },
                    {new: true}
                    );          
            }


            const getallratings = await Product.findById(prodId);
            let totalRating = getallratings.ratings.length;
            let ratingsum = getallratings.ratings
                .map( (item) => item.star )
                .reduce( (prev, curr) => prev+curr, 0);
            let actualRating = Math.round(ratingsum / totalRating);
            let finalProduct = await Product.findByIdAndUpdate(prodId,
                {
                totalrating: actualRating,
            },
            {new : true,
            });
            res.json(finalProduct) ;
    } catch (error) {
        throw new Error(error);
    }
});


const uploadImages = asyncHandler (async (req, res) => {

    try {
        const uploader = (path) => cloudinaryUploadImg(path, 'images');
        const urls = [];
        const files = req.files;
      
        for (const file of files) {
            const { path } = file;   
            const newpath = await uploader(path);
         
             urls.push(newpath);
             fs.unlinkSync(path);
        }

        const images =  urls.map( (file) => {
            return file;
        });

        res.json(images);
       
    } catch (error) {
        throw new Error(error);
    }
    

});

const deleteImages = asyncHandler (async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = cloudinaryDeleteImg(id, 'images');
        res.json({ message : 'Deleted' });
       
    } catch (error) {
        throw new Error(error);
    }
    

});




module.exports = { 
    createProduct ,
    getaProduct ,
    getAllProducts,
    updateProduct ,
    deleteProduct,
    addToWishlist,
    rating,
    uploadImages,
    deleteImages
};

