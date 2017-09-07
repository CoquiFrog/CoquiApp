require('dotenv').config()

const express = require ('express')
, bodyParser = require('body-parser')
, passport = require('passport')
, Auth0Strategy = require('passport-auth0')
, massive = require('massive')
, session = require('express-session');

const app = express();

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUnitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


//DATABASE CONNECTION
massive(process.env.CONNECTIONSTRING).then(db => {
    app.set('db', db);
})


//AUTHENTICATION
passport.use(new Auth0Strategy({
    domain: process.env.AUTH_DOMAIN,
    clientID: process.env.AUTH_CLIENT_ID,
    clientSecret:
    process.env.AUTH_CLIENT_SECRET,
    callbackURL: process.env.AUTH_CALLBACK
}, function(accessToken, refreshToken, extraParams, profile, done){
    
    const db = app.get('db');
//the below find_user calls the SQL file that you created
    db.find_user(profile.id).then( user =>{
        if(user[0]){
        return done(null, user);
        } else{
            //it is expecting 4 data.value, thingies from the SQL file ($1, $2, $3, $4)
            db.create_user([profile.displayName, profile.emails[0].value,
            profile.picture, profile.id]).then ( user => {
                return done(null, user[0]);
            })
        }
    })  

}))
//this will be a function that takes in two parameters.  We need done here.
//We are just passing the user down along so it can be accessed later.

//This is invoked one time to set things up
//THIS PUTS IT ON

passport.serializeUser(function(user, done){
    done(null, user)
})

//USER COMES FROM SESSION - THIS IS INVOKED FOR EVERY ENDPOINT
//THIS PULLS IT OFF
passport.deserializeUser(function(user, done){
    console.log(user) //this gives user info for debugging
    app.get('db').find_session_user(user[0].id).then(user =>{
        return done(null,user[0]);
    })
})

app.get('/auth', passport.authenticate('auth0'));

//if authentication fails, it will send the user back using this next part
app.get('/auth/callback', passport.authenticate('auth0', {
    successRedirect: 'http://localhost:3000/#/private',
    failureRedicrect:'http://localhost:3000/#/',
}))

let PORT = 3005;

console.log(process.env.TEST) //This makes your ENV file print in console




app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
})