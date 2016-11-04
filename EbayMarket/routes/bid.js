var express = require('express');
var router = express.Router();
var tools = require('./tools')
var fecha = require('fecha');
var mysql = require('./mysql')
var async = require('async');


/* GET users listing. */
router.get('/getBid/:itemId', function(req, res, next) {
    tools.eventLog(new Date(), req.session.user.id, req.params.itemId, 'view bid history');

    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;

    mysql.operate(req, 'getBid', function (result) {
        
        if (result === false) {
            res.render('viewbid',
                {
                    bids: null,
                    msg:'There is no bid for this item'
                });
        } else {
            for (var i = 0; i < result.length; i++) {
                result[i].bidDate = fecha.format(result[i].bidDate, 'MMM D, YYYY H:mm:ss');
            }
            res.render('viewbid',
                {
                    bids: result,
                    msg:''
                });
        }
    })
});

router.post('/placeBid', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;
    tools.biddingLog(new Date(), req.session.user.id, req.session.item.itemId, req.body.bidAmount);
    //validation
    if (req.body.bidAmount == '') {
        res.render('auction',
            {
                item: req.session.item,
                msg: 'Please enter a proper bid amount'
            }
        )
    } else {
        //console.log('addToCart: userId= ' + req.session.user.id + ' itemId=' + req.session.item.itemId + ' quantity= ' + req.body.buyQuantity);
        var r = new Object();
        r.sellerId = req.session.item.userId;
        r.buyerId = req.session.user.id;
        r.itemId = req.session.item.itemId;
        r.bidAmount = req.body.bidAmount;
        r.bidDate = fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
        mysql.operate(r, 'placeBid', function (result) {
            if (result == null) { //error
                res.render('auction',
                    {
                        item: req.session.item,
                        msg: 'Place bid error'
                    }
                )
            } else {
                mysql.operate(r, 'updateCurrBid', function (result) {
                    res.redirect('/bid/getBid/' + req.session.item.itemId);
                })

            }
        })
    }
        
});

router.get('/allauction', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;

    mysql.operate(req, 'allAuction', function (result) {
        if (result === false) {
            res.render('allauction', {
                items: result,
                msg: 'You have no auction item.'
            });
        } else {
            for (var i = 0; i < result.length; i++) {
                result[i].datePost = fecha.format(result[i].datePost, 'MMM D, YYYY H:mm');
                result[i].dateExpire = fecha.format(result[i].dateExpire, 'MMM D, YYYY H:mm');
            }
            res.render('allauction', {
                items: result,
                msg: undefined
            });
        }
    })
});

router.get('/allbidding', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;

    mysql.operate(req, 'allBidding', function (result) {
        if (result === false) {
            res.render('allbidding', {
                items: result,
                msg: 'You have no bidding item.'
            });
        } else {
            for (var i = 0; i < result.length; i++) {
                result[i].bidDate = fecha.format(result[i].bidDate, 'MMM D, YYYY H:mm');
                result[i].dateExpire = fecha.format(result[i].dateExpire, 'MMM D, YYYY H:mm');
            }
            res.render('allbidding', {
                items: result,
                msg: undefined
            });
        }
    })
});

module.exports = router;
