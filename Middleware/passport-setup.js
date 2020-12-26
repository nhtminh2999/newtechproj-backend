const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
let User = require('../Models/User.Model');

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: '41487083680-h1tfgem76ot4oqlcjvtssc3au8vlo04p.apps.googleusercontent.com',
    clientSecret: 'osoTth8ucACQk5lD7us1fKM9',
    callbackURL: 'http://localhost:3001/User/google/callback',
    passReqToCallback: true
},
    async function (request, accessToken, refreshToken, profile, done) {
        const existedUser = await User.findOne({ User_GoogleId: profile.id });
        if (!existedUser) {
            const user = new User();
            user.User_GoogleId = profile.id;
            user.User_Fullname = profile.displayName;
            await user.save();
            return done(null, user);
        } else {
            const user = existedUser;
            return done(null, user);
        }
    }
));

passport.use(new FacebookStrategy({
    clientID: '3772141579489668',
    clientSecret: '7ad28d672cc2f83c74e64351ba90d416',
    callbackURL: 'http://localhost:3001/User/facebook/callback',
},
    async function (request, accessToken, refreshToken, profile, done) {
        const existedUser = await User.findOne({ User_FacebookId: profile.id });
        if (!existedUser) {
            const user = new User();
            user.User_FacebookId = profile.id;
            user.User_Fullname = profile.displayName;
            await user.save();
            return done(null, user);
        } else {
            const user = existedUser;
            return done(null, user);
        }
    }
));


