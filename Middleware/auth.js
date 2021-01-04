const jwt = require('jsonwebtoken')
const User = require('../Models/User.Model');

const auth = async (req, res, next) => {
    const bearerHeader = req.header('Authorization');
    if (!bearerHeader) {
        res.json({ message: 'No token provided...' });
    } else {
        try {
            const token = req.header('Authorization').replace('Bearer ', '');
            const data = jwt.verify(token, 'toihocmern');
            const user = await User.findOne({ _id: data._id });
            if (!user) {
                throw new Error();
            }
            req.user = user;
            req.token = token;
            next();
        } catch (error) {
            req.timeOut = error;
            next();
        }
    }
}

module.exports = auth;
