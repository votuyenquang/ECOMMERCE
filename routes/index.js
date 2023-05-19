const authRouter = require('../routes/authRoute');
const productRouter = require('../routes/productRoute');
const blogRouter = require('../routes/blogRoute');
const prodcategoryRouter = require('../routes/prodcategoryRoute');
const blogcategoryRoter = require('../routes/blogCatRoute')
const brandRouter = require('../routes/brandRoute');
const couponRoute = require('../routes/couponRoute');
function route(app) {

    app.use('/api/user', authRouter);
    app.use('/api/product', productRouter);
    app.use('/api/blog', blogRouter);
    app.use('/api/category', prodcategoryRouter);
    app.use('/api/blogcategory', blogcategoryRoter);
    app.use('/api/brand',brandRouter);
    app.use('/api/coupon',couponRoute);


 
}

module.exports = route;