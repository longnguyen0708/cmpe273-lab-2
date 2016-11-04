/**
 * Created by longnguyen on 9/29/16.
 */
var mysql = require("mysql");
var async = require("async");

var pool    =   mysql.createPool({
    connectionLimit : 1,
    host     : '54.70.90.14',
    user     : 'test',
    password : 'test',
    database : 'test',
    debug    :  false
});

function operate(req,type,callback) {
    async.waterfall([
            function(callback) {
                pool.getConnection(function(err,connection){

                    if(err) {
                        callback(err, true);
                    } else {
                        callback(null,connection);
                    }
                });
            },
            function(connection,callback) {
                var query;
                switch(type) {
                    case "signup":
                        query = 'INSERT into users(email,password,firstName, lastName, lastLogin) VALUES (' +
                            connection.escape(req.body.email) +','+connection.escape(req.body.password)+','+
                            connection.escape(req.body.firstName)+','+connection.escape(req.body.lastName) + ', ' + connection.escape(req.body.lastLogin) + ')';
                        break;
                    case "addProfile":
                        query = 'INSERT into profile(userId) VALUES (' +
                            connection.escape(req.id) + ')';
                        break;
                    case "checkEmail":
                        query = 'SELECT email from users where email=' + connection.escape(req.body.email);
                        break;
                    case "authenticate":
                        query = 'SELECT email from users where email=' + connection.escape(req.session.user.email);
                        break;
                    case "signin":
                        query = 'SELECT * from users where email=' + connection.escape(req.body.email);
                        break;
                    case "updateLastLogin":
                        query = 'UPDATE users set lastLogin= ' + connection.escape(req.body.lastLogin) +' where email=' + connection.escape(req.body.email);
                        break;
                    case "profile":
                        query = 'SELECT * from users,profile where id=' + connection.escape(req.session.user.id)
                        + ' AND users.id=profile.userId';
                        break;
                    case "updateProfile":
                        query = 'UPDATE profile SET street=' + connection.escape(req.body.street)
                            + ',' + 'city=' + connection.escape(req.body.city)
                            + ',' + 'state=' + connection.escape(req.body.state)
                            + ',' + 'zipcode=' + connection.escape(req.body.zipcode)
                            + ',' + 'country=' + connection.escape(req.body.country)
                            + ' where userId=' + connection.escape(req.session.user.id);
                        break;
                    case "allselling":
                        query = 'SELECT * from items where userId =' + connection.escape(req.session.user.id)
                        + ' AND type = 0';
                        break;
                    case "sold":
                        query = 'SELECT * from orders, items, users where orders.sellerId=' + connection.escape(req.session.user.id)
                            + ' AND ' + 'orders.itemId=items.id' 
                            + ' AND ' + 'orders.buyerId=users.id';
                        break;
                    case "bought":
                        query = 'SELECT * from orders, items, users where orders.buyerId=' + connection.escape(req.session.user.id)
                            + ' AND ' + 'orders.itemId=items.id'
                            + ' AND ' + 'orders.sellerId=users.id';
                        break;
                    case "items":
                        query = 'SELECT items.type, items.id as itemId, items.description, users.firstName, users.lastName, profile.state, profile.country, items.buyNowPrice, items.num, items.startPrice, items.currBid, items.bids' +
                            ' from items, users, profile where items.userId !=' + connection.escape(req.session.user.id) +
                            ' AND items.soldNum < items.num AND users.id = items.userId AND users.id=profile.userId';
                        break;
                    case "item":
                        query = 'SELECT *, items.id as itemId from items, profile, users where items.id =' + connection.escape(parseInt(req.params.id))
                        + ' AND items.userId = profile.userId AND items.userId = users.id';
                        break;
                    case "registerItem":
                        query = 'insert into items(type, name, description, soldNum, num, startPrice, buyNowPrice, currBid, datePost, dateExpire, cond, bids, userId) values('
                            + connection.escape(req.body.type) + ',' + connection.escape(req.body.name) + ',' + connection.escape(req.body.description)
                            + ',' + '0' + ',' + connection.escape(parseInt(req.body.num)) + ',' + connection.escape(parseFloat(req.body.startPrice))
                            + ',' + connection.escape(parseFloat(req.body.buyNowPrice))+ ',' + connection.escape(parseFloat(req.body.currBid)) + ',' + connection.escape(req.body.datePost)
                            + ',' + connection.escape(req.body.dateExpire) + ',' + connection.escape(req.body.cond) + ',' + '0' + ',' + connection.escape(req.session.user.id) + ')';
                        break;
                    case "addtoCart":
                        query = 'INSERT into cart(buyerId,itemId,quantity) VALUES (' +
                            connection.escape(req.session.user.id) +','+connection.escape(req.session.item.itemId)
                            + ',' + connection.escape(req.body.buyQuantity) + ')';
                        break;
                    case "getCart":
                        query = 'SELECT * from cart, items where cart.buyerId=' + connection.escape(req.session.user.id)
                            + ' AND ' + 'cart.itemId=items.id';
                        break;
                    case "getCartItem":
                        query = 'SELECT * from cart where buyerId=' + connection.escape(req.session.user.id)
                            + ' AND ' + 'itemId='+connection.escape(req.session.item.itemId);
                        break;
                    case "updateCart":
                        query = 'UPDATE cart SET quantity=' + connection.escape(req.quantity) 
                            + ' where buyerId=' + connection.escape(req.buyerId)
                                    + ' AND itemId=' + connection.escape(req.itemId);
                        break;
                    case "removeCartItem":
                        query = 'DELETE from cart where buyerId=' + connection.escape(req.session.user.id)
                            + ' AND ' + 'itemId='+connection.escape(req.params.itemId);
                        break;
                    case "deleteCart":
                        query = 'DELETE from cart where buyerId=' + connection.escape(req.session.user.id);
                        break;
                    case "updateItems":
                        query = 'UPDATE items SET soldNum=' + connection.escape(req.quantity + req.soldNum)
                            + ' where id=' + connection.escape(req.itemId);
                        break;
                    case "addOrder":
                        query = 'INSERT into orders(sellerId,buyerId,itemId,quantity, orderDate) VALUES (' +
                            connection.escape(req.userId) +','+connection.escape(req.buyerId)
                            + ',' + connection.escape(req.itemId) + ',' + connection.escape(req.quantity)
                            + ',' + 'NOW()' + ')';
                        break;
                    case "placeBid":
                        query = 'INSERT into bids(sellerId,buyerId,itemId,bidAmount, bidDate) VALUES (' +
                            connection.escape(req.sellerId) +','+connection.escape(req.buyerId)
                            + ',' + connection.escape(req.itemId) + ',' + connection.escape(req.bidAmount)
                            + ',' +  connection.escape(req.bidDate) + ')';
                        break;
                    case "getBid":
                        query = 'SELECT * from bids,items, users where bids.itemId=' + connection.escape(req.params.itemId)
                            + ' AND ' + 'bids.itemId=items.id' + ' AND bids.buyerId=users.id'
                            + ' ORDER BY bids.bidDate DESC';
                        break;
                    case "updateCurrBid":
                        query = 'UPDATE items SET currBid=' + connection.escape(req.bidAmount) + ', '
                                + 'bids = bids+1 '
                                + ' where id=' + connection.escape(req.itemId);
                        break;
                    case "allAuction":
                        query = 'SELECT * from items where userId =' + connection.escape(req.session.user.id)
                            + ' AND type = 1';
                        break;
                    case "allBidding":
                        query = 'SELECT * from bids, items, users where bids.buyerId=' + connection.escape(req.session.user.id)
                            + ' AND ' + 'bids.itemId=items.id'
                            + ' AND ' + 'bids.sellerId=users.id';
                        break;
                    default :
                        break;
                }
                callback(null,connection,query);
            },
            function(connection,query,callback) {
                connection.query(query,function(err,rows){
                    console.log('Mysql operator: conn_id= ' + connection.threadId + ' query= ' + query);
                    connection.release();
                    if(!err) {

                        if(type === "signin" || type === "profile") {
                            callback(null, rows.length === 0 ? false : rows[0]);
                        } else if(type === "authenticate") {
                            callback(null, rows.length === 0 ? false : true);
                        } else if(type === "checkEmail") {
                            callback(null, rows.length === 0 ? false : true);
                        } else if(type === "items" || type === "getCart" || type === "allselling"
                        || type === "sold" || type === "bought" || type === 'getBid' || type === 'allAuction'
                        || type === 'allBidding') {
                            callback(null, rows.length === 0 ? false : rows);
                        } else if(type === "item" || type === 'getCartItem') {
                            callback(null, rows.length === 0 ? false : rows[0]);
                        } else {
                            console.log('Query type: ' + type);
                            callback(null, true);
                        }
                    } else {
                        callback(err, true);
                    }
                });
            }],
        function(err, result){
            console.log('Query err: ' + err + ' result: ' + result);
            if(err) {
                callback(null);
            } else {
                callback(result);
            }
        });
}

exports.operate = operate