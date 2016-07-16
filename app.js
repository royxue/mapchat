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

/**
 * request parameters:
 * {
   *    username: "xxx"
   *    password:
   *    geolocation:
   * }
 */

io.on('connection', function( socket ) {
  console.log("connected");

  /**
   * Data Format:
   * username
   * room : {users:[]}
   */
  socket.on("join", function(data) {
    console.log(data);
    socket.join(data.room);
    var users = [];
    for (var userInRoom in data.room.users) {
      users.push(currentUser[userInRoom]);
    }
    var result = {'usersLocation' : users};
    socket.broadcast.to(data.room).emit("usersLocation", result);
  });

  socket.on("exit", function(data) {
    socket.broadcast.to(data.room).emit("exitClient", data.username);
  });

  /**
   * request parameters:
   * {
   *    username: "xxx"
   *    password:
   *    geolocation:
   * }
   */
  app.post('/signup', function(req, res) {
    var longitude = req.params.longitude;
    var latitude = req.params.latitude;
    var geolocation = {};
    geolocation.latitude = latitude;
    geolocation.longitude = longitude;
    user.username = req.params.username;
    user.password = req.params.password;
    user.geolocation = geolocation;
    currentUser[req.params.username] = user;
    console.log(req.params.username + "signed up at" + data.geolocation);

    res.render('chat.js', {isLogin: true});
  });

  /**
   * data format:
   * {
   *  username:
   *  geolocation:
   *  password:
   * }
   */
  socket.on("login", function(data) {
    if ((data.username in currentUser) && (currentUser[data.username].password == data.password)) {
      currentUser[data.username].geolocation = data.geolocation;
      socket.emit("loginResult", "true");
    } else {
      socket.emit("loginResult", "false");
    }
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
    socket.emit("getgeomsg", currentUsers[data.username].geolocation);
  });


  /**
   * data format :
   * {
   *  username :
   * }
   */
  // return all active users except self
  socket.on("activeUser", function(data) {
    console.log("get activeUser");
    var users = [];
    for (var user in currentUser) {
      if (currentUser.hasOwnProperty(user) && user !== data.username) {
        users.push(user);
      }
    }
    var result = {'users' : users};
    socket.emit('users', result);
  });
});


module.exports = app;
