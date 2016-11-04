var express = require('express');
var router = express.Router();
var tools = require('./tools')
var fecha = require('fecha');
var mysql = require('./mysql')

/* GET users listing. */
router.get('/auctionItem', tools.authenticate, function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;
    mysql.operate(req, 'profile', function (result) {
        res.render('auctionitem', {generalError: '', address: result});
    });
});

router.post('/auctionItem', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;

    var now = new Date();
    var fourDaysMore = new Date(now.valueOf() + 1000*60*60*24*4);
    var currTime = fecha.format(now, 'YYYY-MM-DD HH:mm:ss');
    var expireTime = fecha.format(fourDaysMore, 'YYYY-MM-DD HH:mm:ss');
    console.log('auctionItem: currTime= ' + currTime + ' expireTime= ' + expireTime);
    req.body.datePost = currTime;
    req.body.dateExpire = expireTime;
    //set type 0
    req.body.type = 1;
    req.body.buyNowPrice = 0;
    req.body.num = 1;
    req.body.currBid = req.body.startPrice;
    mysql.operate(req, 'registerItem', function (result) {
        if (result == null) { //error
            mysql.operate(req, 'profile', function (result) {
                res.render('auctionitem', {generalError: 'Auction item error', address: result});
            });
        } else {
            mysql.operate(req, 'updateProfile', function (result) {});
    
            res.render('auctionItemResult', {
                description: req.body.description,
                startPrice: req.body.startPrice,
                cond: req.body.cond,
                datePost: req.body.datePost,
                dateExpire: req.body.dateExpire
            })
        }
    })
});


router.get('/sellBuyItem', tools.authenticate, function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;
    mysql.operate(req, 'profile', function (result) {
        res.render('sellbuyitnowitem', {generalError: '', address: result});
    });
});

router.post('/sellBuyItem', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;
    //validation

    var currTime = fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
    console.log('sellBuyItem: currTime= ' + currTime);
    req.body.datePost = currTime;
    req.body.dateExpire = currTime;
    //set type 0
    req.body.type = 0;
    req.body.startPrice = 0;
    req.body.currBid = 0;
    
    mysql.operate(req, 'registerItem', function (result) {
        if (result == null) { //error
            mysql.operate(req, 'profile', function (result) {
                res.render('sellbuyitnowitem', {generalError: 'register item error', address: result});
            });
        } else {
            mysql.operate(req, 'updateProfile', function (result) {});

            res.render('registerItemResult', {
                description: req.body.description,
                quantity: req.body.num,
                buyNowPrice: req.body.buyNowPrice,
                cond: req.body.cond,
                datePost: req.body.datePost
            })
        }
    })
});

router.get('/profile', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;
    mysql.operate(req, 'profile', function (result) {
        res.render('profile', {
            msg: '',
            profile: result
        });
    })
    
});

router.post('/updateProfile', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;
    //validation

    mysql.operate(req, 'updateProfile', function (result) {
        if (result == null) { //error
            mysql.operate(req, 'profile', function (result) {
                res.render('profile', {
                    msg: 'Update profile error',
                    profile: result
                });
            })
        } else {
            mysql.operate(req, 'profile', function (result) {
                res.render('profile', {
                    msg: '',
                    profile: result
                });
            })
        }
    })
});

router.get('/allselling', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;
    mysql.operate(req, 'allselling', function (result) {
        if (result === false) {
            res.render('allselling', {
                items: result,
                msg: 'You have no selling item.'
            });
        } else {
            for (var i = 0; i < result.length; i++) {
                result[i].datePost = fecha.format(result[i].datePost, 'MMM D, YYYY H:mm:ss');
            }
            res.render('allselling', {
                items: result,
                msg: undefined
            });
        }
    })

});

router.get('/sold', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;
    mysql.operate(req, 'sold', function (result) {
        if (result === false) {
            res.render('sold', {
                items: result,
                msg: 'You have no sold item.'
            });
        } else {
            for (var i = 0; i < result.length; i++) {
                result[i].datePost = fecha.format(result[i].datePost, 'MMM D, YYYY H:mm:ss');
                result[i].orderDate = fecha.format(result[i].orderDate, 'MMM D, YYYY H:mm:ss');
            }
            res.render('sold', {
                items: result,
                msg: undefined
            });
        }
    })

});

router.get('/bought', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;
    mysql.operate(req, 'bought', function (result) {
        if (result === false) {
            res.render('bought', {
                items: result,
                msg: 'You have no bought item.'
            });
        } else {
            for (var i = 0; i < result.length; i++) {
                result[i].orderDate = fecha.format(result[i].orderDate, 'MMM D, YYYY H:mm:ss');
            }
            res.render('bought', {
                items: result,
                msg: undefined
            });
        }
    })

});



module.exports = router;
