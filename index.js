const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const port = process.env.PORT || 3000;
const morgan = require('morgan');
const dbConnect = require('./config/dbConnect');
const route = require('./routes');
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middelwares/errorHandler');
const cookieParser = require('cookie-parser');



dbConnect();

app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));
app.use(cookieParser());

route(app);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
