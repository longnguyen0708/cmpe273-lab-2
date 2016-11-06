/**
 * Created by longnguyen on 9/28/16.
 */
var express = require('express');
var router = express.Router();
var fecha = require('fecha');
var mq_client = require('../rpc/client');

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
    var email = req.body.username;
    var pwd = req.body.password;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    console.log('[CLIENT] Signup: ' + email + '   ' + pwd + '     ' + firstName + '   ' + lastName);
    //Todo: validate
    if (req.body.username == '') {
        res.locals.signupMsg = 'Please enter your email address.'
    } else if (req.body.reEmail != req.body.username) {
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

        const payload = {
            action: "SIGNUP",
            content: req.body
        }
        mq_client.make_request('user_info_queue',payload, function(err,result){

            if(err){
                throw err;
            }
            else {
                if (result.code == 1) {
                    res.render('signin',
                        {
                            tab: 'signup',
                            signinMsg: '',
                            signupMsg: 'Your email address is already registered. Please sign in.'

                        });
                } else {
                    res.redirect('/signin');
                }
            }
        });
    }
});

module.exports = router;