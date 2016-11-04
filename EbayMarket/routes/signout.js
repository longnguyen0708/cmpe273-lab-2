/**
 * Created by longnguyen on 9/29/16.
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    req.session.destroy();
    res.redirect('/signin');
});

module.exports = router;