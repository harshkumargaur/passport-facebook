require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const ejs = require('ejs');
const passport = require('passport')
const facebookStrategy = require('passport-facebook').Strategy
const User = require('./models/user.model');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// let currentUser;
// console.log(currentUser);

/*
this function will protect the routes from unauthorized access
*/

const protect = async function(req,res,next){
    console.log(req.isAuthenticated());
    next();
    // try {
    //     if(req.user){
    //         const user = await User.findOne({email:req.user.email});
    //         if (!user) {
    //             throw new Error('you must register first')
                
    //         }
    //         next();

    //     }else{
    //         throw new Error('must be logged in')
    //     }
    // } catch (error) {
    //     res.status(400).send(error.message);
    // }
}


const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'sessions'
})
app.use(session({
    secret: process.env.SECRET_1,
    store: store,
    resave: false,
    saveUninitialized: true
}))

store.on('error', (error) => console.log(error));


app.use(passport.initialize());
app.use(passport.session())
app.use(passport.authenticate('session'));

passport.serializeUser(function (profile, done) {
    return done(null, profile)
});
passport.deserializeUser(function (profile, done) {
    return done(null, profile);
});



const verify = async function (accessToken, refreshToken, profile, done) {
    console.log(profile);
    const user = await User.findOne({email:profile.emails[0].value,provider:'facebook'});

    if (user) {
        return done(null,user)
        
    } else {
        const newUser = await User.create({
            facebookId: profile.id,
            email:profile.emails[0].value,
            provider:profile.provider,
            photo:profile.photos[0].value
        })
        console.log(newUser);
        return done(null,newUser);
    }
   
}

passport.use(new facebookStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'https://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email']
}, verify));

app.get('/',protect, (req, res) => {
    res.status(200).render('home', { title: 'Home' });
})


app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email,user_photos' }));
app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/secret',
            failureRedirect : '/'
        }));

app.get('/secret', (req, res) => {
    res.render('secret', { title: 'secret' })
})

app.get('/test', (req, res) => {
    console.log(req.user);
    res.render('testing', { title: 'testing' })
})

app.get('/logout', (req, res) => {
    req.user = null;
    app.locals.currentUser= null;
    req.logout((err) => {
        if (err) {
            console.log(err);
        }
        
        req.session.destroy();
        res.redirect('/');
    });
})

app.all('*', (req, res) => {
    res.status(404).send('path not exists');
})

module.exports = app;