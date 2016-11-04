/**
 * Created by longnguyen on 9/29/16.
 */
var mysql = require('./mysql');
const fs = require('fs');
var fecha = require('fecha');

var authenticate = function (req, res, next) {
    console.log('authenticate: ' + req.session + '     ' + req.session.user);
    if (req.session.user == undefined || req.session.user == null) {
        res.redirect('/signin');
    } else {
        res.locals.firstName = req.session.user.firstName;
        res.locals.cartItemNum = req.session.user.cartItemNum;
        next();
    }
}

var eventLog = function (timeStamp, userId, objectId, desc) {
    fs.appendFile('tracking_log.txt', 'Event Log,' + fecha.format(timeStamp, 'YYYY-MM-DD HH:mm:ss') +',' + userId + ',' + objectId + ',' + desc + '\n', function(err) {
        if (err) {
            console.log(err);
        }
    });
}

var biddingLog = function (timeStamp, userId, itemId, bidAmount) {
    fs.appendFile('tracking_log.txt', 'Bidding Log,' + fecha.format(timeStamp, 'YYYY-MM-DD HH:mm:ss') +',' + userId + ',' + itemId + ',' + bidAmount + '\n', function(err) {
        if (err) {
            console.log(err);
        }
    });
}

exports.authenticate = authenticate
exports.eventLog = eventLog
exports.biddingLog = biddingLog