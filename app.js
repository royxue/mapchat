var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var socketIO = require('socket.io'),
    session = require('express-session'),
    fs = require("fs"),
    async = require('async');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(session({
  secret: "Hello World",
  resave: false,
  saveUninitialized: true,
  cookie :{
    maxAge: 1000 * 86400
  }
}));

app.use( express.static( __dirname + '/public' ) );

var server_port =  3000;
var server_ip_address = '127.0.0.1';

var server = app.listen( server_port, server_ip_address, function () {
  var host = server.address().address,
      port = server.address().port;
});

var io = socketIO(server);

/**
 * data format:
 * {
 *    rooms: [
 *       room {
 *          usernames:[username1, username2..]
 *       }
 *    ]
 * }
 */
currentRooms = {};
/**
 * data format:
 * {
 *    [username]: user {
 *      username:
 *      password:
 *      geolocation:
 *    }
 * }
 */
currentUser = {};


app.use(function (req, res) {
  res.status(404);
  res.send("Not Found");
});

io.on('connection', function( socket ) {
  console.log("connected");
  socket.on("join", function(data) {
    console.log(data);
    socket.join(data.room);
    socket.broadcast.to(data.room).emit("newClient", data.username);
  });

  socket.on("exit", function(data) {
    socket.broadcast.to(data.room).emit("exitClient", data.username);
  });

  /**
   * data format:
   * {
   *    username: "xxx"
   *    password:
   *    geolocation:
   * }
   */
  socket.on("signup", function(data) {
    user.username = data.username;
    user.geolocation = data.geolocation;
    currentUser[data.username] = user;
    console.log(data.username + " signed up at" + data.geolocation);
    socket.broadcast.emit("signup", "successful");
  });

  /**
   * data format:
   * {
   *
   * }
   */
  socket.on("login", function(data) {

  });

  /**
   * data format:
   * {
   *    username:
   *    room: {
   *      usernames: [username1, username2...]
   *    }
   *    msg:
   * }
   */
  socket.on("sendmsg", function(data) {
    console.log(data.username + " send message: " + data.msg);
    socket.broadcast.to(data.room).emit("sendmsg", data);
  });

  /**
   * data format:
   * {
   *    username:
   *    geomsg:
   * }
   */
  socket.on("sendgeomsg", function(data) {
    console.log(data.username + " update geo message to: " + data.geomsg);
    currentUsers[data.username].geolocation = data.deomsg;
  });

  /**
   * data format:
   * {
   *    username:
   * }
   */
  socket.on("getgeomsg", function(data) {
    console.log(data.username + "'s location is: " + currentUsers[data.username].geolocation);
    socket.broadcast.emit("getgeomsg", currentUsers[data.username].geolocation);
  });

});


module.exports = app;
