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
            callback(null, {bids: [],  msg:'There is no bid for this item'})
        } else {
            callback(null, {bids: docs, msg: ''})
        }
    });
}



exports.handleMsg = handleMsg;
