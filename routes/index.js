var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/chat", function (req, res) {
  res.render('chat');
});

/**
 * request parameters:
 * {
   *    username: "xxx"
   *    password:
   *    geolocation:
   * }
 */
router.post('/login', function(req, res) {
  var user = {};
  var longitude = req.body.longitude;
  var latitude = req.body.latitude;
  user.username = req.body.username;
  user.password = req.body.password;
  var geolocation = {};
  geolocation.latitude = latitude;
  geolocation.longitude = longitude;
  user.geolocation = geolocation;
  currentUser[req.body.username] = user;
  res.render('chat', {isLogin: true, username:req.body.username});
});

/**
 * request parameters:
 * {
   *    username: "xxx"
   *    password:
   *    geolocation:
   * }
 */
router.post('/signup', function(req, res) {
  var user = {};
  var longitude = req.body.longitude;
  var latitude = req.body.latitude;
  var geolocation = {};
  geolocation.latitude = latitude;
  geolocation.longitude = longitude;
  user.username = req.body.username;
  user.password = req.body.password;
  user.geolocation = geolocation;
  currentUser[req.body.username] = user;
  // console.log("username: " + currentUser[req.body.username].username);
  // console.log("[signup] location: longtitude: " + req.body.longitude + "; latitude: " + req.body.latitude);
  res.render('chat', {isLogin: true, username:req.body.username});
});

module.exports = router;
