"use strict";
var express = require('express')
   ,app = express()
   ,exec = require('child_process').exec;

app.use(express.compress());
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/html'));
app.use(express.bodyParser());

app.post('/fetchData', function(req, res) {
  var fetchCommand = "curl -L -s " + req.body.url +
                     " |hxpipe |awk '{if (substr($1,1,1) == \"(\" ||" +
                     " substr($1,1,1) == \"|\") {print substr($1,2)}}'";

  console.log('Attempting fetch from: ' + req.body.url);

  exec(fetchCommand, function(error, stdout) {
    if (error) {
      console.log('Error fetching data - ' + error.message);
      return res.end();
    }
    res.end(stdout.substr(0, stdout.length - 1));
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log('Node web server started');
});
