var express = require('express');
var app = express();

app.use(express.compress());
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/sound'));
app.use(express.static(__dirname + '/robots'));
app.use(express.static(__dirname + '/v2'));
app.use(express.static(__dirname + '/html'));
app.use(express.bodyParser());

var svr = app.listen(process.env.PORT || 3000, function() {
  console.log('Node web server started');
});
