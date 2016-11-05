var express = require('express');
var router = express.Router();
var tools = require('./tools')
var fecha = require('fecha');
var mysql = require('./mysql')
var async = require('async');
var mq_client = require('../rpc/client');

var addToCartButtonId = 'btn100';
var buttonCheckOutId = 'btn101';
var confirmCheckoutButtonId = 'btn102';

/* GET users listing. */
router.get('/getCart', tools.authenticate, function(req, res, next) {
    console.log('[CLIENT] getCart ' + req.session.user._id , '');
    const payload = {
        action: "GET_CART",
        content: {
            userId: req.session.user._id
        }
    }
    mq_client.make_request('cart_queue', payload, function(err,result){

        if(err){
            throw err;
        }
        else
        {
            if (result.code == 404) {
                req.session.user.cartItemNum = 0;
                res.locals.cartItemNum = req.session.user.cartItemNum;
                res.render('cart',
                    {
                        cart: null,
                        msg:'Your shopping cart is empty.'
                    });
            } else {
                //assign total item session
                req.session.user.cartItemNum = result.total;
                res.locals.cartItemNum = req.session.user.cartItemNum;
                res.render('cart',
                    {
                        cart: result.cart,
                        msg: result.msg
                    });
            }
        }
    });


});

router.post('/addToCart', function(req, res, next) {
    tools.eventLog(new Date(), req.session.user.id, addToCartButtonId, 'add item to cart');

    console.log('[CLIENT] addToCart ' + req.session.user._id , ' itemId=' + req.session.item._id + ' quantity= ' + req.body.buyQuantity);
    const payload = {
        action: "ADD_TO_CART",
        content: {
            userId: req.session.user._id,
            itemId: req.session.item._id,
            description: req.session.item.description,
            cond: req.session.item.cond,
            buyNowPrice: req.session.item.buyNowPrice,
            quantity: req.body.buyQuantity
        }
    }
    mq_client.make_request('cart_queue',payload, function(err,result){

        if(err){
            throw err;
        }
        else
        {
            res.redirect('/cart/getCart');
        }
    });

});

router.post('/updateCart', function(req, res, next) {
    tools.eventLog(new Date(), req.session.user.id, req.body.itemId, 'update item in cart');

    console.log('[CLIENT] updateCart ' + req.session.user._id , ' itemId=' + req.body.itemId + ' quantity= ' + req.body.quantity);
    const payload = {
        action: "UPDATE_CART",
        content: {
            userId: req.session.user._id,
            itemId: req.body.itemId,
            quantity: req.body.quantity
        }
    }
    mq_client.make_request('cart_queue',payload, function(err,result){

        if(err){
            throw err;
        }
        else
        {
            res.redirect('/cart/getCart');
        }
    });
});

router.get('/removeCartItem/:itemId', function(req, res, next) {
    tools.eventLog(new Date(), req.session.user.id, req.params.itemId, 'remove item in cart');

    console.log('[CLIENT] removeCartItem ' + req.session.user._id , ' itemId=' + req.params.itemId);
    const payload = {
        action: "REMOVE_CART_ITEM",
        content: {
            userId: req.session.user._id,
            itemId: req.params.itemId,
        }
    }
    mq_client.make_request('cart_queue',payload, function(err,result){

        if(err){
            throw err;
        }
        else
        {
            res.redirect('/cart/getCart');
        }
    });

});


router.post('/checkout', function(req, res, next) {
    tools.eventLog(new Date(), req.session.user.id, buttonCheckOutId, 'checkout');
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;

    console.log('[CLIENT] checkout ' + req.session.user._id );
    const payload = {
        action: "CHECK_OUT",
        content: {
            userId: req.session.user._id
        }
    }
    mq_client.make_request('cart_queue',payload, function(err,result){

        if(err){
            throw err;
        }
        else
        {
            console.log(typeof result.msg, ' msg.length= ' +  result.msg.length)
            if (result.msg.length > 2) {
                console.log(typeof result.msg, ' msg.length 2= ' +  result.msg.length)
                res.render('cart',
                    {
                        cart: result.cart,
                        msg: result.msg
                    });
            } else {

                res.render('checkout',
                    {
                        quantity: result.total,
                        price: result.price,
                        msg: ''
                    });
            }
        }
    });
});

router.post('/confirmCheckout', function(req, res, next) {
    tools.eventLog(new Date(), req.session.user.id, confirmCheckoutButtonId, 'confirm checkout');
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;
    //TODO: validate credit card
    res.locals.quantity = req.body.quantity;
    res.locals.price = req.body.price;
    if (req.body.cardNumber == '' || req.body.cardNumber.length != 16 || !req.body.cardNumber.match(/\d{16}/g)) {
        res.locals.msg = 'Please enter a valid credit or debit card number.'
    } else if (req.body.expireMonth == '' || req.body.expireDay == '' ||
        req.body.securityCode   == '' || req.body.firstName  == '' ||  req.body.lastName  == '') {
        res.locals.msg = 'Please enter a valid credit or debit card info.'
    }
    //
    if (res.locals.msg != undefined) {
        res.render('checkout');
    } else {

        console.log('[CLIENT] confirmCheckout ' + req.session.user._id );
        const payload = {
            action: "CONFIRM_CHECK_OUT",
            content: {
                userId: req.session.user._id
            }
        }
        mq_client.make_request('cart_queue',payload, function(err,result){

            if(err){
                throw err;
            }
            else
            {
                if (result.msg.length > 2) {
                    res.render('cart',
                        {
                            cart: result.cart,
                            msg: result.msg
                        });
                } else {

                    req.session.user.cartItemNum = 0;
                    res.locals.cartItemNum = req.session.user.cartItemNum;
                    res.render('confirmOrder',
                        {
                            cart: result.cart
                        });
                }
            }
        });
    }
});

module.exports = router;
