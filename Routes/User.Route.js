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
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
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
            res.status(201).send({ user, token })
        }
    } catch (error) {
        res.status(400).send(error)
    }
});

const isLoggedIn = async (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

router.get('/failed', function (req, res) {
    res.json({ message: 'You failed to login !' });
})

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
})

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
})

router.get('/me', auth, async (req, res) => {
    // View logged in user profile
    res.send(req.user);
})

module.exports = router;

