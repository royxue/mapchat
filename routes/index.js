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
  var longitude = req.params.longitude;
  var latitude = req.params.latitude;
  user.username = req.params.username;
  user.password = req.params.password;
  var geolocation = {};
  geolocation.latitude = latitude;
  geolocation.longitude = longitude;
  user.geolocation = geolocation;
  currentUser[req.params.username] = user;
  console.log(req.params.username + "log in at" + data.geolocation);
  res.render('chat.js', {isLogin: true, username: req.params.username});
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

  res.render('chat.js', {isLogin: true, username: req.params.username});
});


module.exports = router;
