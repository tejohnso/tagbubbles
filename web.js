var express = require('express');
var http = require('http');
var https = require('https');
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

app.post('/fetchData', function(req, res) {
  fetchURL(req.body.url);

  function fetchURL(url) {
    var siteContents = '', protocol = url.substr(0,5) === 'https' ? https : http;
    console.log('Attempting fetch from: ' + url);

    protocol.get(url, function(fetchRes) {
      fetchRes.on('data', function(chunk) {
        siteContents += chunk;
      });
      fetchRes.on('end', function() {
        if (fetchRes.statusCode === 301) {
          console.log('redirecting to: ' + fetchRes.headers.location);
          return fetchURL(fetchRes.headers.location);
        }
        res.end(siteContents);
      });
    });
  }
});

var svr = app.listen(process.env.PORT || 3000, function() {
  console.log('Node web server started');
});
