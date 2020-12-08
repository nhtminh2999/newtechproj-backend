const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const auth = require('../Middleware/auth')

let User = require('../Models/User.Model');

const router = express.Router();

router.post('/create', async (req, res) => {
    //Create a new user
    try {
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        return res.json({ user, token })
    } catch (error) {
        return res.status(400).send(error);
    }
});

router.post('/login', async (req, res) => {
    //Login a registered user
    try {
        const { User_Name, User_Password } = req.body;
        const user = await User.findOne({ User_Name });
        if (!user) {
            throw new Error({ error: 'Invalid login credentials' })
        }
        const isPasswordMatch = await user.comparePassword(User_Password);
        if (!isPasswordMatch) {
            throw new Error({ error: 'Invalid login credentials' })
        } else {
            const token = await user.generateAuthToken()
            return res.json({ user, token })
        }
    } catch (error) {
        return res.status(400).send(error)
    }
});

const isLoggedIn = async (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
};

router.get('/failed', function (req, res) {
    res.json({ message: 'You failed to login !' });
});

router.get('/good', isLoggedIn, async function (req, res) {
    const getUser = await User.findOne({ User_Name: req.user.email });
    if (!getUser) {
        const user = new User();
        user.User_Name = req.user.email;
        user.User_Fullname = req.user.displayName;
        await user.save();
        const token = await user.generateAuthToken();
        res
            .cookie('access_token', 'Bearer ' + token,
                {
                    expires: new Date(Date.now() + 8 * 3600000) // cookie will be removed after 8 hours
                })
            .cookie('user_name', user.User_Name,
                {
                    expires: new Date(Date.now() + 8 * 3600000) // cookie will be removed after 8 hours
                })
            .redirect(`http://localhost:3000`)
    } else {
        const user = getUser;
        const token = await user.generateAuthToken();
        res
            .cookie('access_token', 'Bearer ' + token,
                { expires: new Date(Date.now() + 8 * 3600000), httpOnly: false },
            )
            .cookie('user_name', user.User_Name,
                { expires: new Date(Date.now() + 8 * 3600000), httpOnly: false })
            .redirect(`http://localhost:3000`)
    }
});

router.get('/google',
    passport.authenticate('google', {
        scope:
            ['email', 'profile']
    }
    ));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/User/failed' }),
    function (req, res) {
        res.redirect('/User/good');
    }
);

router.get('/logout', function (req, res) {
    req.session = null;
    req.logOut();
    res.redirect('/');
});

router.get('/me', auth, async (req, res) => {
    // View logged in user profile
    res.send(req.user);
});

router.post('/getDataFilter', async (req, res) => {
    const searchModel = req.body;
    let query1 = {};
    let query2 = {};
    let queryStatus = {};
    if (!!searchModel.Status) {
        queryStatus.Status = searchModel.Status;
    }
    if (!!searchModel.Value) {
        query1.User_Fullname = { $regex: searchModel.Value, $options: 'i' };
        query2.User_Name = { $regex: searchModel.Value, $options: 'i' };
    }
    const options = {
        select: 'id User_Name User_Fullname',
        sort: '1',
        limit: 10,
    }
    User.find({ $and: [queryStatus, { $or: [query1, query2] }] }, null, options, function (err, result) {
        if (err) {
            return res.json({ message: 'Failed', result: err })
        } else {
            return res.json({ message: 'Success', result })
        }
    });
});

module.exports = router;

