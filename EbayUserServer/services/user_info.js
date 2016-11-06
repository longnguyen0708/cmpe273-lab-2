/**
 * Created by longnguyen on 11/2/16.
 */
var async = require('async');
var mongo = require('../db/mongo')
var mongodb = require('mongodb');
var fecha = require('fecha');
var bcrypt = require('bcrypt');
const saltRounds = 10;

function handleMsg(msg, callback){

    console.log("[USER SERVER (INFO)] handle_msg", msg)

    switch (msg.action)
    {
        case 'UPDATE_PROFILE':
            updateProfile(msg.content, callback)
            break
        case 'SIGNUP':
            signup(msg.content, callback)
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

var signup = function(req, callback) {
    const col = mongo.collection('users')
    col.findOne({username: req.username},function(err, doc) {
        if (!doc) {
            bcrypt.hash(req.password, saltRounds, function(err, hash) {
                console.log('[SERVER] password before encrypt ', req.password)
                req.password = hash
                console.log('[SERVER] password after encrypt ', req.password)
                col.insertOne(req, function(err, r){
                    callback(null, {code:0})
                })
            });

        } else {
            callback(null, {code:1})
        }
    });
}



exports.handleMsg = handleMsg;
