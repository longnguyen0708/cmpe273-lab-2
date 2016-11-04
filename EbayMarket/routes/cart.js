var express = require('express');
var router = express.Router();
var tools = require('./tools')
var fecha = require('fecha');
var mysql = require('./mysql')
var async = require('async');

var addToCartButtonId = 'btn100';
var buttonCheckOutId = 'btn101';
var confirmCheckoutButtonId = 'btn102';

/* GET users listing. */
router.get('/getCart', tools.authenticate, function(req, res, next) {
    mysql.operate(req, 'getCart', function (result) {
        if (result == null) { //error
            res.render('cart',
                {
                    cart: null,
                    msg:'There is an error with getting cart.'
                });
        } else if (result === false) {//not valid email
            req.session.user.cartItemNum = 0;
            res.locals.cartItemNum = req.session.user.cartItemNum;
            res.render('cart',
                {
                    cart: null,
                    msg:'Your shopping cart is empty.'
                });
        } else {
            var updated = false;
            var total = 0;
            async.each(result,
                function(item, callback){
                    console.log('getCart: itemId= ' + item.itemId)
                    if (item.quantity + item.soldNum > item.num) {
                        updated = true;
                        item.quantity = item.num - item.soldNum;
                        //update item to Cart
                        // req.body.quantity = result[i].quantity;
                        // req.body.itemId = result[i].itemId;
                        mysql.operate(item, 'updateCart', function (r) {
                        });
                    }
                    total += item.quantity;
                    callback();
                },

                function(){
                    // All tasks are done now
                    console.log('getCart: updated= ' + updated)
                    //assign total item session
                    req.session.user.cartItemNum = total;
                    res.locals.cartItemNum = req.session.user.cartItemNum;
                    
                    var msg = '';
                    if (updated) msg = 'The quantity of items in your cart has been adjusted to match the inventory '
                    res.render('cart',
                        {
                            cart: result,
                            msg:msg
                        });
                }
            );
        }
    })
});

router.post('/addToCart', function(req, res, next) {
    tools.eventLog(new Date(), req.session.user.id, addToCartButtonId, 'add item to cart');

    console.log('addToCart: userId= ' + req.session.user.id + ' itemId=' + req.session.item.itemId + ' quantity= ' + req.body.buyQuantity);
    mysql.operate(req, 'getCartItem', function (result) {
        if (result == null) { //error
        } else if (result === false) {//item not exist
            mysql.operate(req, 'addtoCart', function (result) {
                if (result == null) { //error
                    res.render('item',
                        {
                            item: result,
                            msg: 'Add to cart error'
                        }
                    )
                } else {
                    res.redirect('/cart/getCart');
                }
            })
        } else {
            // req.body.quantity = parseInt(req.body.buyQuantity) + parseInt(result.quantity);
            // req.body.itemId = req.session.item.itemId;
            var item = new Object();
            item.quantity = parseInt(req.body.buyQuantity) + parseInt(result.quantity);
            item.buyerId = req.session.user.id;
            item.itemId = req.session.item.itemId;
            mysql.operate(item, 'updateCart', function (r) {
            });
            res.redirect('/cart/getCart');
        }
    })
});

router.post('/updateCart', function(req, res, next) {
    tools.eventLog(new Date(), req.session.user.id, req.body.itemId, 'update item in cart');
    var item = new Object();
    item.quantity = req.body.quantity;
    item.buyerId = req.session.user.id;
    item.itemId = req.body.itemId;
    mysql.operate(item, 'updateCart', function (result) {
            res.redirect('/cart/getCart');
    })
});

router.get('/removeCartItem/:itemId', function(req, res, next) {
    tools.eventLog(new Date(), req.session.user.id, req.params.itemId, 'remove item in cart');
    mysql.operate(req, 'removeCartItem', function (result) {
        res.redirect('/cart/getCart');
    })
});


router.post('/checkout', function(req, res, next) {
    tools.eventLog(new Date(), req.session.user.id, buttonCheckOutId, 'checkout');
    res.locals.firstName = req.session.user.firstName;
    res.locals.cartItemNum = req.session.user.cartItemNum;
    mysql.operate(req, 'getCart', function (result) {
        if (result == null) { //error
            res.render('cart',
                {
                    cart: null,
                    msg:'There is an error with getting cart.'
                });
        } else if (result === false) {//not valid email
            res.render('cart',
                {
                    cart: null,
                    msg:'Your shopping cart is empty, but it doesn\'t have to be.'
                });
        } else {
            var updated = false;
            var q = 0;
            var p = 0;
            async.each(result,
                function(item, callback){
                    if (item.quantity + item.soldNum > item.num) {
                        updated = true;
                        item.quantity = item.num - item.soldNum;
                        //update item to Cart
                        // req.body.quantity = result[i].quantity;
                        // req.body.itemId = result[i].itemId;
                        mysql.operate(item, 'updateCart', function (r) {
                        })
                    }
                    q += item.quantity;
                    p += item.quantity * item.buyNowPrice;
                    callback();
                },

                function(){
                    // All tasks are done now
                    if (updated) {
                            var msg = 'The quantity of items in your cart has been adjusted to match the inventory '
                            res.render('cart',
                                {
                                    cart: result,
                                    msg: msg
                                });
                    } else {

                            res.render('checkout',
                                {
                                    quantity: q,
                                    price: p,
                                    msg: ''
                                });
                    }
                }
            );
        }
    })
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
        mysql.operate(req, 'getCart', function (result) {
            if (result == null) { //error
                res.render('cart',
                    {
                        cart: null,
                        msg: 'There is an error with getting cart.'
                    });
            } else if (result === false) {//not valid email
                res.render('cart',
                    {
                        cart: null,
                        msg: 'Your shopping cart is empty, but it doesn\'t have to be.'
                    });
            } else {
                var updated = false;
                async.each(result,
                    function (item, callback) {
                        if (item.quantity + item.soldNum > item.num) {
                            updated = true;
                            item.quantity = item.num - item.soldNum;
                            //update item to Cart
                            // req.body.quantity = result[i].quantity;
                            // req.body.itemId = result[i].itemId;
                            mysql.operate(item, 'updateCart', function (r) {
                            })
                        }
                        callback();
                    },

                    function () {
                        // All tasks are done now
                        if (updated) {
                            var msg = 'The quantity of items in your cart has been adjusted to match the inventory '
                            res.render('cart',
                                {
                                    cart: result,
                                    msg: msg
                                });
                        } else {
                            async.each(result,
                                function (item, callback) {
                                    console.log("confirmCheckout: itemId= " + item.itemId);
                                    if (item.quantity > 0) {
                                        mysql.operate(item, 'updateItems', function (r) {
                                        });

                                        mysql.operate(item, 'addOrder', function (r) {
                                        });
                                    }
                                },

                                function (err) {
                                    // All tasks are done now
                                }
                            );


                            mysql.operate(req, 'deleteCart', function (r) {

                            });
                            req.session.user.cartItemNum = 0;
                            res.locals.cartItemNum = req.session.user.cartItemNum;
                            res.render('confirmOrder',
                                {
                                    cart: result
                                });
                        }
                    }
                );


            }
        })
    }
});

module.exports = router;
