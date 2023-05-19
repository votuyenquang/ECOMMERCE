const { default: mongoose } = require('mongoose');
const dbConnect = () => {
    try {
        const conn =  mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to database")
    } catch (err) {
        console.log("Connection db error")
    }
}

module.exports = dbConnect;
