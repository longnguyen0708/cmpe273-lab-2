
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongo = require('../db/mongo');
var bcrypt = require('bcrypt');


module.exports = function(passport) {
    passport.use('signin', new LocalStrategy(function(username, password, done) {
        console.log('Before signin: ' + username + ' ' + password)
        var loginCollection = mongo.collection('users');
        var whereParams = {
            username:username
        }

        process.nextTick(function(){
            loginCollection.findOne(whereParams, function(error, user) {


                if(error) {
                    return done(err);
                }

                if(!user) {
                    return done(null, false);
                }

                bcrypt.compare(password, user.password, function(err, res) {
                    if (res == true) {
                        console.log('Signin successfully ', user.username);
                        done(null, user);
                    } else {
                        console.log('wrong password ', user.username);
                        done(null, false);
                    }
                });


            });
        });
    }));
}


