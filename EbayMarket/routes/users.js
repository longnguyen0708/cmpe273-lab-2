var express = require('express');
var router = express.Router();
var tools = require('./tools')
var fecha = require('fecha');
var mysql = require('./mysql')
var mq_client = require('../rpc/client');

/* GET users listing. */
router.get('/auctionItem', tools.authenticate, function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;
    res.render('auctionitem', {generalError: ''});
});

router.post('/auctionItem', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;

    var now = new Date();
    var fourDaysMore = new Date(now.valueOf() + 1000*60*60*24*4);
    var currTime = fecha.format(now, 'YYYY-MM-DD HH:mm:ss');
    var expireTime = fecha.format(fourDaysMore, 'YYYY-MM-DD HH:mm:ss');

    console.log('[CLIENT] auctionItem ' + req.session.user._id );
    const payload = {
        action: "REGISTER_ITEM",
        content: {
            type:1,
            name:req.body.name,
            description:req.body.description,
            soldNum:0,
            num:1,
            startPrice:req.body.startPrice,
            currBid:req.body.startPrice,
            datePost: currTime,
            dateExpire:expireTime,
            cond:req.body.cond,
            bids:0,
            userId:req.session.user._id,
            userName: req.session.user.firstName + ' ' + req.session.user.lastName,
            location: req.session.user.city + ',' + req.session.user.state + ',' + req.session.user.country
        }
    }
    mq_client.make_request('user_sale_queue',payload, function(err,result){
        if(err){
            throw err;
        }
        else
        {
            res.render('auctionItemResult', {
                description: req.body.description,
                startPrice: req.body.startPrice,
                cond: req.body.cond,
                datePost: currTime,
                dateExpire: expireTime
            })
        }
    });
});


router.get('/sellBuyItem', tools.authenticate, function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;
    res.render('sellbuyitnowitem', {generalError: ''});
});

router.post('/sellBuyItem', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;
    //validation

    var currTime = fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss');

    console.log('[CLIENT] sellBuyItem ' + req.session.user._id );
    const payload = {
        action: "REGISTER_ITEM",
        content: {
            type:0,
            name:req.body.name,
            description:req.body.description,
            soldNum:0,
            num:req.body.num,
            buyNowPrice:req.body.buyNowPrice,
            datePost: currTime,
            cond:req.body.cond,
            userId:req.session.user._id,
            userName: req.session.user.firstName + ' ' + req.session.user.lastName,
            location: req.session.user.city + ',' + req.session.user.state + ',' + req.session.user.country
        }
    }
    mq_client.make_request('user_sale_queue',payload, function(err,result){
        if(err){
            throw err;
        }
        else
        {
            res.render('registerItemResult', {
                description: req.body.description,
                quantity: req.body.num,
                buyNowPrice: req.body.buyNowPrice,
                cond: req.body.cond,
                datePost: currTime
            })
        }
    });
});

router.get('/profile', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;
        res.render('profile', {
            profile: req.session.user
        });
    
});

router.post('/updateProfile', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;

    console.log('[CLIENT] updateProfile ' + req.session.user._id );
    const payload = {
        action: "UPDATE_PROFILE",
        content: {
            userId: req.session.user._id,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            zipcode: req.body.zipcode,
            country: req.body.country
        }
    }
    mq_client.make_request('user_info_queue',payload, function(err,result){
        if(err){
            throw err;
        }
        else
        {
            req.session.user.street = req.body.street
            req.session.user.city = req.body.city
            req.session.user.state = req.body.state
            req.session.user.country = req.body.country
            req.session.user.zipcode = req.body.zipcode
            res.render('profile', {
                profile: req.session.user
            });
        }
    });
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
