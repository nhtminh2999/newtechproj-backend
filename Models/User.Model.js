const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    User_Fullname: {
        type: String,
    },
    User_Name: {
        type: String,
    },
    User_GoogleId: {
        type: String,
    },
    User_FacebookId: {
        type: String,
    },
    User_Password: {
        type: String,
    },
})

userSchema.pre('save', async function (next) {
    const user = this;

    if (!user.isModified('User_Password')) {
        return next();
    }

    bcrypt.hash(user.User_Password, null, null, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.User_Password = hash;
    });
});

userSchema.methods.generateAuthToken = async function () {
    //// Generate an auth token for the user
    const user = this;
    const token = jwt.sign({ _id: user._id }, 'toihocmern', { expiresIn: '1m' });
    return token;
}

userSchema.methods.comparePassword = function (password) {
    const user = this;
    return bcrypt.compareSync(password, user.User_Password);
};

const User = mongoose.model('User', userSchema, 'User');

module.exports = User;



