//super simple rpc server example
var amqp = require('amqp')
    , util = require('util');

var userSale = require('./services/user_sale')
var userInfo = require('./services/user_info')

var cnn = amqp.createConnection({host:'127.0.0.1'});

cnn.on('ready', function(){
  console.log("listening on user_sale_queue");

  cnn.queue('user_sale_queue', function(q){
    q.subscribe(function(message, headers, deliveryInfo, m){
      util.log(util.format( deliveryInfo.routingKey, message));
      util.log("Message: "+JSON.stringify(message));
      util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
      userSale.handleMsg(message, function(err,res){

        //return index sent
        cnn.publish(m.replyTo, res, {
          contentType:'application/json',
          contentEncoding:'utf-8',
          correlationId:m.correlationId
        });
      });
    });
  });


  console.log("listening on user_info_queue");

  cnn.queue('user_info_queue', function(q){
    q.subscribe(function(message, headers, deliveryInfo, m){
      util.log(util.format( deliveryInfo.routingKey, message));
      util.log("Message: "+JSON.stringify(message));
      util.log("DeliveryInfo: "+JSON.stringify(deliveryInfo));
      userInfo.handleMsg(message, function(err,res){

        //return index sent
        cnn.publish(m.replyTo, res, {
          contentType:'application/json',
          contentEncoding:'utf-8',
          correlationId:m.correlationId
        });
      });
    });
  });

});