/**
 * Created by longnguyen on 11/2/16.
 */
var async = require('async');
var mongo = require('../db/mongo')
var mongodb = require('mongodb');
var fecha = require('fecha');

function handleMsg(msg, callback){

    console.log("[SALE SERVER] handle_msg", msg)

    switch (msg.action)
    {
        case 'GET_CART':
            getCart(msg.content, callback)
            break
        case 'ADD_TO_CART':
            addToCart(msg.content, callback)
            break
        case 'UPDATE_CART':
            updateCart(msg.content, callback)
            break
        case 'REMOVE_CART_ITEM':
            removeCartItem(msg.content, callback)
            break
        case 'CHECK_OUT':
            checkout(msg.content, callback)
            break
        case 'CONFIRM_CHECK_OUT':
            confirmCheckOut(msg.content, callback)
            break
        default:
            callback(null, {code: 404})
    }
}

var addToCart = function(req, callback) {
    const col = mongo.collection('cart')
    col.findOne({userId: req.userId, itemId: req.itemId},function(err, doc) {
        if (!doc) {
            col.insertOne(req, function(err, r){})
        } else {
            const quantity = parseInt(req.quantity) + parseInt(doc.quantity);
            col.updateOne({userId: req.userId, itemId: req.itemId}, {$set: {quantity: quantity}}, function(err, r){})
        }
        callback(null, {})
    });
}

var getCart = function (req, callback) {
    const col = mongo.collection('cart')
    col.find({userId: req.userId}).toArray(function(err, docs) {
        console.log('[SERVER] get_cart', docs)
        if (docs.length == 0) {
            callback(null, {code: 404})
        } else {

            var updated = false;
            var total = 0;
            var price = 0;
            async.each(docs,
                function(item, callback){
                    console.log('getCart: itemId= ' + item.itemId)

                    const itemsCol = mongo.collection('items')
                    const whereParams = {
                        _id: new mongodb.ObjectID(item.itemId)
                    }
                    itemsCol.findOne(whereParams, function(err, doc) {
                        console.log('[SERVER] get_item result', doc)
                        if (parseInt(item.quantity) + parseInt(doc.soldNum) > parseInt(doc.num)) {
                            updated = true;
                            item.quantity = parseInt(doc.num) - parseInt(doc.soldNum);
                            col.updateOne({userId: req.userId, itemId: item.itemId}, {$set: {quantity: item.quantity}}, function(err, r){})
                        }
                        item.soldNum = doc.soldNum;
                        item.sellerId = doc.userId;
                        total += parseInt(item.quantity);
                        price += parseInt(item.quantity) * parseFloat(item.buyNowPrice);
                        callback();
                    });

                },

                function(){
                    // All tasks are done now
                    console.log('getCart: updated= ' + updated)

                    var msg = '';
                    if (updated) msg = 'The quantity of items in your cart has been adjusted to match the inventory '
                    const result = {
                        msg: msg,
                        total: total,
                        price: price,
                        cart : docs
                    }
                    callback(null, result)
                }
            );


        }
    });
}

var updateCart = function(req, callback) {
    const col = mongo.collection('cart')
    col.updateOne({userId: req.userId, itemId: req.itemId}, {$set: {quantity: req.quantity}}, function(err, r){
        console.log('[SERVER] updateCart ', req)
        callback(null,{})
    })

}

var removeCartItem = function(req, callback) {
    const col = mongo.collection('cart')
    col.remove({userId: req.userId, itemId: req.itemId}, function(err, r){
        console.log('[SERVER] removeCartItem ', req)
        callback(null,{})
    })
}

var checkout = function(req, callback) {
    getCart(req, callback)
}

var confirmCheckOut = function(req, callback) {
    getCart(req, function(err, result) {
        if (result.msg.length > 2) {
            callback(null, result)
        } else {
            async.each(result.cart,
                function (item, callback) {
                    console.log("confirmCheckout: itemId= ", item);
                    if (item.quantity > 0) {
                        const col = mongo.collection('items')
                        const whereParams = {
                            _id: new mongodb.ObjectID(item.itemId)
                        }
                        col.updateOne(whereParams, {$set: {soldNum: parseInt(item.quantity) + parseInt(item.soldNum)}}, function(err, r){
                        })
                        const colOrder = mongo.collection('orders')
                        item.orderDate = fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
                        colOrder.insertOne(item, function(err, r){})
                    }
                },

                function (err) {
                    // All tasks are done now
                }
            );


            const colCart = mongo.collection('cart')
            colCart.remove({userId: req.userId}, function(err, r){
                console.log('[SERVER] removeCart ', req)
            })
            callback(null, result)
        }
    })
}

exports.handleMsg = handleMsg;
