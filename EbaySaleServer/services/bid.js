/**
 * Created by longnguyen on 11/2/16.
 */
var async = require('async');
var mongo = require('../db/mongo')
var mongodb = require('mongodb');
var fecha = require('fecha');

function handleMsg(msg, callback){

    console.log("[SALE SERVER (BID)] handle_msg", msg)

    switch (msg.action)
    {
        case 'GET_BID':
            getBids(msg.content, callback)
            break
        case 'PLACE_BID':
            placeBid(msg.content, callback)
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

var placeBid = function(req, callback) {
    const col = mongo.collection('bids')
    col.insertOne(req, function(err, r){
        const colItems = mongo.collection('items')
        const whereParams = {
            _id: new mongodb.ObjectID(req.itemId)
        }
        colItems.updateOne(whereParams,{$inc: {bids: 1}, $set: {currBid: req.bidAmount}}, function(err, r){
            callback(null, {})
        })
    })
}

var getBids = function (req, callback) {
    const col = mongo.collection('bids')
    col.find({itemId: req.itemId}, {"sort": [['bidDate', 'desc']]}).toArray(function(err, docs) {
        console.log('[SERVER] get_bid', docs)
        if (docs.length == 0) {
            callback(null, {bids: null,  msg:'There is no bid for this item'})
        } else {
            callback(null, {bids: docs, msg: ''})
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
