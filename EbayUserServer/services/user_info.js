/**
 * Created by longnguyen on 11/2/16.
 */
var async = require('async');
var mongo = require('../db/mongo')
var mongodb = require('mongodb');
var fecha = require('fecha');

function handleMsg(msg, callback){

    console.log("[USER SERVER (INFO)] handle_msg", msg)

    switch (msg.action)
    {
        case 'UPDATE_PROFILE':
            updateProfile(msg.content, callback)
            break
        default:
            callback(null, {code: 404})
    }
}

var updateProfile = function(req, callback) {
    const col = mongo.collection('users')
    const whereParams = {
        _id: new mongodb.ObjectID(req.userId)
    }
    col.updateOne(whereParams, {$set: {street: req.street, city: req.city, state: req.state, country: req.country, zipcode: req.zipcode}}, function(err, r){
        console.log('[SERVER] updateProfile ', req)
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
