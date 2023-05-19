const Blog = require('../models/blogModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId');
const  cloudinaryUploadImg = require('../utils/cloudinary'); 
const fs = require('fs');

// create a new blog
const createBlog = asyncHandler( async (req,res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.json(newBlog);
    } catch (error) {
        throw new Error(error)
    }
});
// update the blog
const updateBlog = asyncHandler( async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedBlog);
    } catch (error) {
        throw new Error(error);
    }
});
// Get a blog 
const getBlog = asyncHandler( async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);

    try {
        const getBlog = await Blog.findById(id)
        .populate('likes')
        .populate('dislikes');
       const updateViews = await Blog.findByIdAndUpdate(id, {
            $inc : {numViews : 1}
        }, {
            new: true
        })
        res.json(getBlog);
    } catch (error) {
        throw new Error(error);
    }
});

// Get all blogs
const getAllBlogs = asyncHandler (async (req, res) => {
    try {
        const getAllBlogs = await Blog.find();
        res.json(getAllBlogs);
    } catch (error) {
        throw new Error (error)
    }
});

// delete blog
const deleteBlog = asyncHandler (async (req, res) => {
    
    const  { id }  = req.params;
    validateMongodbId(id);
    try {
        const deletedBlog = await Blog.findByIdAndDelete(id);
        res.json(deletedBlog);
    } catch (error) {
        throw new Error (error)
    }
});

// like blog
const likeBlog = asyncHandler (async (req, res) => {
    const { blogId  } = req.body;
    validateMongodbId(blogId);

    // find the blog you want to like
    const blog = await Blog.findById(blogId);
   
    // find the login user
    const loginUserId = req?.user?._id;

    // check if the user already liked the blog
    const isLiked = blog?.isLiked;
    // check id the usser already dislike the blog
    const alreadyDisliked = blog?.dislikes?.find(
        (userId => userId?.toString() === loginUserId?.toString())
    );
    if (alreadyDisliked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull : { dislikes : loginUserId},
            isDisLiked: false,
        }, {
            new:true
        });
        res.json(blog);
    }
    if (isLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull : { likes : loginUserId},
            isLiked: false,
        }, {
            new:true
        });
        res.json(blog);
    }
    else {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $push : { likes : loginUserId},
            isLiked: true,
        }, {
            new:true
        });
        res.json(blog);

    }
});


// dislike blog
const dislikeBlog = asyncHandler (async (req, res) => {
    const { blogId  } = req.body;
    validateMongodbId(blogId);

    // find the blog you want to dislike
    const blog = await Blog.findById(blogId);
   
    // find the login user
    const loginUserId = req?.user?._id;

    // check if the user already Disliked the blog
    const isDisliked = blog?.isDisLiked;
    // check id the usser already Like the blog
    const alreadyLiked = blog?.likes?.find(
        (userId => userId?.toString() === loginUserId?.toString())
    );
    if (alreadyLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull : { likes : loginUserId},
            isLiked: false,
        }, {
            new:true
        });
        res.json(blog);
    }
    if (isDisliked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull : { dislikes : loginUserId},
            isDisLiked: false,
        }, {
            new:true
        });
        res.json(blog);
    }
    else {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $push : { dislikes : loginUserId},
            isDisLiked: true,
        }, {
            new:true
        });
        res.json(blog);

    }
});


const uploadImages = asyncHandler (async (req, res) => {
    const  {id} = req.params;
    validateMongodbId(id);
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
        const findBlog = await Blog.findByIdAndUpdate(id, 
            {
                images: urls.map( (file) => {
                    return file;
                }), 
            },
        { new : true });
        res.json(findBlog);
       
    } catch (error) {
        throw new Error(error);
    }
    

});

module.exports = {
    createBlog,
    updateBlog,
    getBlog,
    getAllBlogs,
    deleteBlog,
    likeBlog,
    dislikeBlog,
    uploadImages,
}
