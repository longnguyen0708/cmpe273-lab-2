/**
 * Created by longnguyen on 10/19/16.
 */

var MongoClient = require('mongodb').MongoClient;
var db;
var connected = false;
const url = "mongodb://54.70.90.14:27017/test"


MongoClient.connect(url, {
    server: {
        poolSize: 20
    }
},function(err, _db){
    if (err) { throw new Error('Could not connect: '+err); }
    db = _db;
    connected = true;
    console.log(connected +" is connected?");
});


var collection = function(name) {
    if (!connected) {
        throw new Error('Must connect to Mongo before calling "collection"');
    }
    return db.collection(name);
};

exports.collection = collection