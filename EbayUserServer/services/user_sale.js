/**
 * Created by longnguyen on 11/2/16.
 */
var async = require('async');
var mongo = require('../db/mongo')
var mongodb = require('mongodb');
var fecha = require('fecha');

function handleMsg(msg, callback){

    console.log("[USER SERVER (SALE)] handle_msg", msg)

    switch (msg.action)
    {
        case 'GET_ALL_AUCTION':
            getAllAuction(msg.content, callback)
            break
        case 'GET_ALL_BIDDING':
            getAllBidding(msg.content, callback)
            break
        case 'REGISTER_ITEM':
            registerItem(msg.content, callback)
            break

        default:
            callback(null, {code: 404})
    }
}

var getAllAuction = function(req, callback) {
    const col = mongo.collection('items')
    col.find({userId: req.userId, type: 1}).toArray(function(err, docs) {
        if (docs.length == 0) {
            callback(null, {items: [], msg: 'You have no auction item.'})
        } else {
            callback(null, {items: docs, msg: undefined})
        }
    });
}

var getAllBidding = function(req, callback) {
    const col = mongo.collection('bids')
    col.find({buyerId: req.userId}).toArray(function(err, docs) {
        if (docs.length == 0) {
            callback(null, {items: [], msg: 'You have no bidding item.'})
        } else {
            callback(null, {items: docs, msg: undefined})
        }
    });
}

var registerItem = function(req, callback) {
    const col = mongo.collection('items')
    col.insertOne(req, function (err, r) {
        callback(null, {})
    })
}

exports.handleMsg = handleMsg;
