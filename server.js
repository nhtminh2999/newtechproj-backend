const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieSession = require('cookie-session');
require('./Middleware/passport-setup');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(cookieSession({
    name: 'newtechproj-session',
    keys: ['key1', 'key2']
}));

app.use(passport.initialize());
app.use(passport.session());

//MongoDb connection
const uri = 'mongodb://localhost:27017/db_newtechproject';
mongoose.Promise = global.Promise;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully")
});

const userRouter = require('./Routes/User.Route');
const customerRouter = require('./Routes/Customer.Route')
app.use('/User', userRouter);
app.use('/Customer', customerRouter);

//Run server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});


