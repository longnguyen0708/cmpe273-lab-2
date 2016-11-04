var express = require('express');
var router = express.Router();
var tools = require('./tools');
var mysql = require('./mysql');
var fecha = require('fecha');

var mq_client = require('../rpc/client');

/* GET home page. */
router.get('/',tools.authenticate, function(req, res, next) {
    // res.locals.firstName = req.session.user.firstName;
    // res.locals.cartItemNum = req.session.user.cartItemNum;
    console.log('index: req.session.user.cartItemNum= ' + req.session.user.cartItemNum);
    console.log('index: res.locals.cartItemNum= ' + res.locals.cartItemNum);

    mq_client.make_request('all_items_queue',{}, function(err,result){

        if(err){
            throw err;
        }
        else
        {
            if (result.code == 404) {//not valid email
                res.render('index',
                    {
                        msg:'There is no item in the store',
                        items: []
                    });
            } else {
                res.render('index',
                    {
                        msg:'',
                        items: result
                    }
                )
            }
        }
    });

  
});

router.get('/item/:id',tools.authenticate, function(req, res, next) {
    tools.eventLog(new Date(), req.session.user.id, req.params.id, 'click on buy it now item');
    const payLoad = {
        id: req.params.id
    }
    mq_client.make_request('item_info_queue', payLoad, function(err,result){

        if(err){
            throw err;
        }
        else
        {
            req.session.item = result;
            res.render('item',
                {
                    item: result,
                    msg:''
                }
            )
        }
    });

});

router.get('/auction/:id',tools.authenticate, function(req, res, next) {
    tools.eventLog(new Date(), req.session.user.id, req.params.id, 'click on auction item');
    const payLoad = {
        id: req.params.id
    }
    mq_client.make_request('item_info_queue', payLoad, function(err,result){

        if(err){
            throw err;
        }
        else
        {
            //TODO: uncomment later
          //  result.dateExpire = fecha.format(result.dateExpire, 'ddd, H:mm');
            req.session.item = result;
            res.render('auction',
                {
                    item: result,
                    msg:''
                }
            )
        }
    });

});


module.exports = router;
