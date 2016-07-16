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
currentUser = {};

socketCache = {};

curChatting = {};

/**
 * data format:
 * {
 *    posts:[ post {
 *      sender:
 *      txtmsg:
 *      fileurl:
 *      geolocation: {
 *        longitude:
 *        latitude:
 *      }
 *    }]
 * }
 */
currentPosts = {
  posts : [
    {
      sender: "Yuqi",
      txtmsg: "Oh here is a Pikachu #PokemonGo",
      fileurl: "/image/pikachu.png",
      geolocation : {
        "longitude" : 37.462743,
        "latitude" : -122.430162
      }
    },
    {
      sender: "Mengjin",
      txtmsg: "Come and get one Articuno!",
      fileurl: "/image/baidulvyou-zhangjiajie.jpg",
      geolocation : {
        "longitude" : 37.596029,
        "latitude" : -122.216610
      }
    }, {
      sender: "ChengGod",
      txtmsg: "Got $10,000 dollars for LinkedIn Intern Hackathon!",
      fileurl:"/image/hackday.jpg",
      geolocation : {
        "longitude" : 37.786543,
        "latitude" : -122.398097
      }
    }
  ]
};

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
    socketCache[data.username] = socket;
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

    var user1 = data.sender;
    var user2 = data.receiver;
    console.log(socketCache);
    if (curChatting[data.token][user2]) {
      socketCache[user2].emit("sendmsg", {msg:data.msg, sender:user1});
      socketCache[user2].emit("display", {msg: data.msg, geolocation: currentUser[user2].geolocation});
    } else {
      curChatting[data.token].stash.push(user2);
      socketCache[user2].emit("remindMsg", {
        token: data.token,
        sender: user1,
        stashCount: curChatting[data.token].stash.length
      });
    }
  });

  socket.on("enterRoom", function (data) {
    curChatting[data.token][data.receiver] = true;
    var arr = curChatting[data.token].stash;
    for (var i = 0; i < arr.length; i++) {
      socketCache[data.receiver].emit("sendmsg", {msg:arr[i], sender:""});
    }
    console.log("arr" + arr.toString());
    console.log(data);
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
    //console.log(data.username + " update geo message to: " + data.geomsg);
    currentUser[data.username].geolocation = data.geomsg;
  });

  /**
   * data format:
   * {
   *    username:
   * }
   */
  socket.on("getgeomsg", function(data) {

    //console.log(data.username + "'s location is: " + currentUser[data.username].geolocation);
    socket.emit("getgeomsg", currentUser[data.username].geolocation);
  });

  socket.on("initTalk", function (data) {
    curChatting[data.token] = {
      stash : []
    };
    curChatting[data.token][data.sender] = true;
    curChatting[data.token][data.receiver] = false;
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
    // console.log(currentUser);
    // console.log(data);
    for (var user in currentUser) {
      if (currentUser.hasOwnProperty(user) && user !== data.username) {
        users.push(user);
      }
    }
    var result = {'users' : users};
    socket.emit('users', result);
  });

  socket.on("post", function(data) {
    socket.broadcast.emit("post", data);
    currentPosts.posts.push(data);
  });

  socket.on("allPosts", function() {
    socket.emit("allPosts", currentPosts.posts);
  });
});


module.exports = app;
