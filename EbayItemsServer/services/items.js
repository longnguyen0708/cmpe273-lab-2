/**
 * Created by longnguyen on 11/2/16.
 */

var mongo = require('../db/mongo')
var mongodb = require('mongodb');


function get_all_items(msg, callback){

    const col = mongo.collection('items')
    col.find({userId: { $ne: msg.userId }}).toArray(function(err, docs) {
        console.log('[SERVER] get_all_items', docs)
        if (docs.length == 0) {
            callback(null, {code: 404})
        } else {
            callback(null, docs)
        }
    });
}


function get_item(msg, callback){
    console.log('[SERVER] get_item msg', msg)
    const col = mongo.collection('items')
    const whereParams = {
        _id: new mongodb.ObjectID(msg.id)
    }
    col.findOne(whereParams, function(err, doc) {
        console.log('[SERVER] get_item result', doc)
        if (doc) {
            callback(null, doc)
        } else {
            callback(null, {code: 404})
        }
    });
}

exports.get_all_items = get_all_items;
exports.get_item = get_item;