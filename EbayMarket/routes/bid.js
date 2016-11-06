var express = require('express');
var router = express.Router();
var tools = require('./tools')
var fecha = require('fecha');
var async = require('async');
var mq_client = require('../rpc/client');

/* GET users listing. */
router.get('/getBid/:itemId', function(req, res, next) {
    tools.eventLog(new Date(), req.session.user.id, req.params.itemId, 'view bid history');

    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;

    console.log('[CLIENT] getBidHistory ' + req.session.user._id , ' itemId=' + req.params.itemId );
    const payload = {
        action: "GET_BID",
        content: {
            itemId: req.params.itemId
        }
    }
    mq_client.make_request('bid_queue',payload, function(err,result){

        if(err){
            throw err;
        }
        else
        {
            for (var i = 0; i < result.bids.length; i++) {
                result.bids[i].bidDate = fecha.format(fecha.parse(result.bids[i].bidDate, 'YYYY-MM-DD HH:mm:ss'), 'MMM D, YYYY H:mm:ss');
            }
            res.render('viewbid',
                {
                    bids: result.bids,
                    msg:result.msg
                });
        }
    });
});

router.post('/placeBid', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;
    tools.biddingLog(new Date(), req.session.user.id, req.session.item.itemId, req.body.bidAmount);
    //validation
    if (req.body.bidAmount == '' || parseFloat(req.body.bidAmount) <= parseFloat(req.session.item.currBid)) {
        res.render('auction',
            {
                item: req.session.item,
                msg: 'Please enter a proper bid amount'
            }
        )
    } else {
        console.log('[CLIENT] placeBid ' + req.session.user._id , ' itemId=' + req.session.item._id + ' bidAmount= ' + req.body.bidAmount);
        const payload = {
            action: "PLACE_BID",
            content: {
                sellerId: req.session.item.userId,
                buyerId: req.session.user._id,
                buyerName: req.session.user.firstName + ' ' + req.session.user.lastName,
                itemId: req.session.item._id,
                description: req.session.item.description,
                bidAmount: req.body.bidAmount,
                cond: req.session.item.cond,
                bidDate: fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                dateExpire: req.session.item.dateExpire
            }
        }
        mq_client.make_request('bid_queue',payload, function(err,result){

            if(err){
                throw err;
            }
            else
            {
                res.redirect('/bid/getBid/' + req.session.item._id);
            }
        });
    }
        
});

router.get('/allauction', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;

    console.log('[CLIENT] getAllAuction ' + req.session.user._id );
    const payload = {
        action: "GET_ALL_AUCTION",
        content: {
            userId: req.session.user._id
        }
    }
    mq_client.make_request('user_sale_queue',payload, function(err,result){

        if(err){
            throw err;
        }
        else
        {

            res.render('allauction', {
                items: result.items,
                msg: result.msg
            });
        }
    });

});

router.get('/allbidding', function(req, res, next) {
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;

    console.log('[CLIENT] getAllBidding ' + req.session.user._id );
    const payload = {
        action: "GET_ALL_BIDDING",
        content: {
            userId: req.session.user._id
        }
    }
    mq_client.make_request('user_sale_queue',payload, function(err,result){

        if(err){
            throw err;
        }
        else
        {

            res.render('allbidding', {
                items: result.items,
                msg: result.msg
            });
        }
    });
});

module.exports = router;
