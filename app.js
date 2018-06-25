var express=require('express');
var path=require('path');
var expressValidator=require('express-validator');
var logger=require('morgan');
var bodyParser=require('body-parser');
var cookieParser=require('cookie-parser');
var session=require('express-session');
var flash=require('connect-flash');
var firebase=require('./firebase');
var db=firebase.FirebaseInstance.database();
var fbAuth=firebase.FirebaseInstance.auth();
var fbref=db.ref();
var admin=firebase.admin;
//route files
var routes = require('./routes/index');
var genres = require('./routes/genres');
var users = require('./routes/users');
var albums = require('./routes/albums');

//init App
var app = express();

//view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//Logger
app.use(logger('dev'));

//Body-Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());

//Handle session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

//validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace=param.split('.')
    , root=namespace.shift()
    , formParam=root;
    while(namespace.length){
      formParam += '[' +namespace.shift() + ']';
    }
    return{
      param : formParam,
      msg   : msg,
      value : value
    };
    }
}));

//static folder
app.use(express.static(path.join(__dirname,'public')));

//connect flash
app.use(flash());

//Global vars
app.use(function(req, res, next){
  res.locals.success_msg=req.flash('success_msg');
  res.locals.error_msg=req.flash('error_msg');
  res.locals.error=req.flash('error');
  res.locals.authdata=fbAuth.currentUser;
  res.locals.page=req.url;
  next();
});

app.get('*',function(req,res,next){
  if(fbAuth.currentUser!=null){
    var userRef=fbref.child('users');
    userRef.orderByChild("uid").startAt(fbAuth.currentUser.uid).endAt(fbAuth.currentUser.uid).on("child_added",function(snapshot){
    res.locals.user=snapshot.val();
  });
  }
  next();
});

//routes
app.use('/', routes);
app.use('/albums', albums);
app.use('/genres', genres);
app.use('/users', users);


//set port
app.set('port', (process.env.port||3000));

//Run Server
app.listen(app.get('port'),function(){
  console.log('server statred on port:'+app.get('port'));
});