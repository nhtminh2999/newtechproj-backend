const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: '41487083680-h1tfgem76ot4oqlcjvtssc3au8vlo04p.apps.googleusercontent.com',
    clientSecret: 'osoTth8ucACQk5lD7us1fKM9',
    callbackURL: "http://localhost:3001/User/google/callback",
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));


