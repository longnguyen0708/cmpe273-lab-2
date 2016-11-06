/**
 * Created by longnguyen on 9/28/16.
 */
var express = require('express');
var router = express.Router();
var fecha = require('fecha');
var tools = require('./tools')
var app = require('../app')


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('signin',
        {
            tab: 'signin',
            signinMsg:'',
            signupMsg:''
        });
});

router.post('/', function (req, res, next) {
    var email = req.body.email;
    var pwd = req.body.password;
  
    console.log('Signin: ' + email + '   ' + pwd );
    //Todo: check email exist
    mysql.operate(req, 'signin', function (result) {
        if (result == null) { //error
            res.render('signin',
                {
                    tab: 'signin',
                    signinMsg:'There is an error with signing in.',
                    signupMsg:''
                });
        } else if (result === false) {//not valid email
            res.render('signin',
                {
                    tab: 'signin',
                    signinMsg:'Oops, that\'s not a match.',
                    signupMsg:''
                });
        } else {
            if (result.password != req.body.password) {
                res.render('signin',
                    {
                        tab: 'signin',
                        signinMsg:'Oops, that\'s not a match.',
                        signupMsg:''
                    });
            } else {
                
                req.session.user = result;

                req.body.lastLogin = fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
                mysql.operate(req, 'updateLastLogin', function (result) {
                    
                })
                
                mysql.operate(req, 'getCart', function (result) {
                  if (result != null) {
                    if (result == false) {
                        req.session.user.cartItemNum = 0;
                        res.redirect('/');
                    }   else {
                        var total = 0;
                        for (var i = 0; i < result.length; i++) {
                            total += result[i].quantity;
                        }
                        req.session.user.cartItemNum = total;
                        console.log('signin: req.session.cartItemNum= ' + req.session.user.cartItemNum);
                        res.redirect('/');
                    }
                  }  
                })
                
            }
        }
    })
});

module.exports = router;