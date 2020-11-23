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
            res.send({ user, token })
        }
    } catch (error) {
        res.status(400).send(error)
    }
});

const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

router.get('/failed', function (req, res) {
    res.json({ message: 'You failed to login !' });
})

router.get('/good', isLoggedIn, function (req, res) {
    res.json({ message: `Welcome ${req.user.displayName}` })
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

