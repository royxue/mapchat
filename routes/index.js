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
  user.username = req.params.username;
  user.password = req.params.password;
  user.geolocation = req.params.geolocation;
  currentUser[req.params.username] = user;
  console.log(req.params.username + "log in at" + data.geolocation);
  res.render('chat');
});

module.exports = router;
