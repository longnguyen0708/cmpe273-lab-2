
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongo = require('../db/mongo');


module.exports = function(passport) {
    passport.use('signin', new LocalStrategy(function(username, password, done) {
        console.log('before signin: ' + username + ' ' + password)
        var loginCollection = mongo.collection('users');
        var whereParams = {
            username:username,
            password:password
        }

        process.nextTick(function(){
            loginCollection.findOne(whereParams, function(error, user) {

                console.log('After signin: ' + user._id)

                if(error) {
                    return done(err);
                }

                if(!user) {
                    return done(null, false);
                }

                if(user.password != password) {
                    done(null, false);
                }

                console.log(user.email);
                done(null, user);
            });
        });
    }));
}


