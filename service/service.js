var express = require("express"),
    app = express(),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    hostname = process.env.HOSTNAME || 'localhost',
    port = parseInt(process.env.PORT, 10) || 8080;

var runMap = {};
var scriptMap = {};

app.use(function(req, res, next){
  if (req.is('text/*')) {
    req.text = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ req.text += chunk });
    req.on('end', next);
  } else {
    next();
  }
});

app.get('/fetch/:id', function(req, res, next) {
    var id = req.param('id');
    var run = runMap[id];
    if ( !run ) {
        res.send("", 200);
    } else {
        var path = "../lua/" + scriptMap[id];
        var data = fs.readFileSync(path, "utf8");
        res.send(data, 200);
        runMap[id] = false;
    }
});

app.get('/register/:id/:script', function(req, res, next) {
    var id = req.param('id');
    var script = req.param('script');
    runMap[id] = true;
    scriptMap[id] = script;
    res.send("", 200);
});

app.get('/set', function( req, res) {
    for ( var id in runMap ) {
        if ( runMap.hasOwnProperty(id) ) {
            runMap[id] = true;
        }
    }
    res.send(200);
});

app.post('/set/:label/:filename', function(req, res) {
    var label = req.param('label');
    if ( !label ) {
        label = 'general';
    }
    var filename = req.param('filename');
    if ( !filename ) {
        res.sendStatus(400);
        return;
    }
    console.log("----------------------------------------")
    console.log("label:", label, "filename:", filename);
    console.log("content: ");
    console.log(req.text);
    res.sendStatus(200);
});

app.listen(port);
