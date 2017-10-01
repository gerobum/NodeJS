var express = require('express');

var app = express(); // the main app
var admin = express(); // the sub app

admin.get('/', function (req, res) {
  //console.log(admin.mountpath); // /admin
  res.send('Admin Homepage');
});


app.get('/', function (req, res) {
  //console.log(admin.mountpath); // /admin
  res.send('Root');
}).use('/admin', admin); // mount the sub app

app.listen(8080);

