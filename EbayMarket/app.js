var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var passport = require('passport');
require('./routes/passport')(passport);
var mq_client = require('./rpc/client');


var routes = require('./routes/index');
var users = require('./routes/users');
var signin = require('./routes/signin');
var signup = require('./routes/signup');
var signout = require('./routes/signout');
var cart = require('./routes/cart');
var bid = require('./routes/bid');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//init session
app.use(session({
  secret: 'rtrgadf35!#%^%@^@fgadfga^$%^',
  resave: false,
  saveUninitialized: false,
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  store: new MongoStore({ url: 'mongodb://54.70.90.14:27017/test' })
}));

app.use(passport.initialize());

app.use('/', routes);
app.use('/user', users);
//app.use('/signin', signin);
app.use('/signup', signup);
app.use('/signout', signout);
app.use('/cart', cart);
app.use('/bid', bid);

app.get('/signin', function(req, res, next) {
  res.render('signin',
      {
        tab: 'signin',
        signinMsg:'',
        signupMsg:''
      });
})

app.post('/signin', function(req, res, next) {
  passport.authenticate('signin', function(err, user, info) {
    if(err) {
      return next(err);
    }

    if(!user) {
      return res.render('signin',
          {
            tab: 'signin',
            signinMsg:'Oops, that\'s not a match.',
            signupMsg:''
          });
    }

    req.logIn(user, {session:false}, function(err) {
      if(err) {
        return next(err);
      }

      req.session.user = user;

      //req.session.user.cartItemNum = 10;
      const payload = {
        action: "GET_CART",
        content: {
          userId: req.session.user._id
        }
      }
      mq_client.make_request('cart_queue', payload, function(err,result){

        if(err){
          throw err;
        }
        else
        {
          if (result.code == 404) {
            req.session.user.cartItemNum = 0;

          } else {
            //assign total item session
            req.session.user.cartItemNum = result.total;

          }

          console.log('signin: req.session.cartItemNum= ' + req.session.user.cartItemNum);
          return res.redirect('/');
        }
      });


    })
  })(req, res, next);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


//module.exports = app;
var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("EbayMarket app listening at http://%s:%s", host, port)

})

exports.passport = passport
