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
var server_ip_address = '0.0.0.0';

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
 *      geolocation: {
 *        latitude:
 *        longitude:
 *      }
 *    }
 * }
 */
currentUser = {
  "ChengWang": {username: "ChengWang", password: "111", geolocation: {latitude: -74, latitude: 41}},
  "RoyXue": {username: "RoyXue", password: "222", geolocation: {latitude: -74, latitude: 41}}
};

socketCache = {};

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

  /**
   * Data Format:
   * username
   * room : {users:[]}
   */
  socket.on("join", function(data) {
    console.log(data);
    socket.join(data.room);
    var users = [];
    var arrayLength = data.room.users.length;
    for (var i = 0; i < arrayLength; i++) {
      socketCache[data.room.users[i]].join(data.room);
      users.push(currentUser[data.room.users[i]]);
    }
    var result = {'usersLocation' : users};
    socket.broadcast.to(data.room).emit("usersLocation", result);
  });

  socket.on("exit", function(data) {
    socket.broadcast.to(data.room).emit("exitClient", data.username);
  });

  socket.on("init", function(data) {
    console.log("init cache socket" + this.socket);
    socketCache[data.username] = this.socket;
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
   * data format {
   *    sender: sender
   *    receiver: receiver
   *    msg:
   * }
   */
  socket.on("sendmsgfor2people", function(data) {
    console.log(data.sender + " send message: " + data.msg);

    var user1 = data.sender;
    var user2 = data.receiver;
    socketCache[user2].emit("sendmsg", {msg:data.msg, sender:user1});
  });


  /**
   * data format:
   * {
   *    username:
   *    geomsg: {
   *      geolocation: {
   *        longitutde: str
   *        latitude: str
   *    }
   * }
   * }
   */
  socket.on("sendgeomsg", function(data) {
    console.log(data.username + " update geo message to: " + data.geomsg);
    currentUsers[data.username].geolocation = data.geomsg;
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
    var users = [];
    for (var user in currentUser) {
      if (currentUser.hasOwnProperty(user) && user !== data.username) {
        users.push(user);
      }
    }
    var result = {'users' : users};
    console.log(result);
    socket.emit('users', result);
  });
});


module.exports = app;
