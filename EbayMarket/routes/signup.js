/**
 * Created by longnguyen on 9/28/16.
 */
var express = require('express');
var router = express.Router();
var mysql = require('./mysql');
var fecha = require('fecha');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('signin',
        {
            tab: 'signup',
            signinMsg:'',
            signupMsg:''
        });
});

router.post('/', function (req, res, next) {
    var email = req.body.email;
    var pwd = req.body.password;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    console.log('Signup: ' + email + '   ' + pwd + '     ' + firstName + '   ' + lastName);
    //Todo: validate
    if (req.body.email == '') {
        res.locals.signupMsg = 'Please enter your email address.'
    } else if (req.body.reEmail != req.body.email) {
        res.locals.signupMsg = 'Looks like these email addresses don’t match.'
    } else if (req.body.password.length < 6 || req.body.password.length > 64) {
        res.locals.signupMsg = 'Use 6 to 64 characters for your password.'
    } else if (req.body.firstName == '' || req.body.lastName == '') {
        res.locals.signupMsg = 'Please enter your name'
    }

    if (res.locals.signupMsg != undefined) {
        res.render('signin',
            {
                tab: 'signup',
                signinMsg: ''
            });
    } else {
        //Todo: check email exist
        mysql.operate(req, 'checkEmail', function (result) {
            if (result === true) { //email exists
                res.render('signin',
                    {
                        tab: 'signup',
                        signinMsg: '',
                        signupMsg: 'Your email address is already registered. Please sign in.'

                    });

            } else {
                //Todo: store to db
                req.body.lastLogin = fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
                mysql.operate(req, 'signup', function (result) {
                    console.log('Signup: result: ' + result);
                    if (result === null) {
                        //return error
                        res.render('signin',
                            {
                                tab: 'signup',
                                signinMsg: '',
                                signupMsg: 'There is an error with signing up.'
                            });
                    } else {
                        mysql.operate(req, 'signin', function (result) {
                            req.session.user = result;
                            req.session.cartItemNum = 0;
                            mysql.operate(result, 'addProfile', function (result) {
                                res.redirect('/');
                            });
                        });

                        
                    }
                })
            }
        })
    }
});

module.exports = router;