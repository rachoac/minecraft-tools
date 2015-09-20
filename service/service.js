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

app.get('/fetch/:userID/:scriptID', function(req, res, next) {
    var userID = req.param('userID');
    var scriptID = req.param('scriptID');

    if ( !scriptMap[scriptID] ) {
        // the script doesn't exist - noop
        console.log("script doesn't exist: ", scriptID);
        res.send("", 200);
        return;
    }

    var userRunMap = runMap[userID];
    if ( !userRunMap ) {
        // lazily create the user program runMap
        userRunMap = {};
        runMap[userID] = userRunMap;
    }

    if ( !userRunMap[scriptID] ) {
        // the script isn't ready to run for the user - noop
        res.send("", 200);
        console.log("script", scriptID, "isn't ready to run for user", userID);
        return;
    }

    // the script is ready to run
    var data = scriptMap[scriptID];
    if ( !data ) {
        // send empty
        data = "";
    }

    // indicate that the script is not ready to run
    userRunMap[scriptID] = false;

    res.send(data, 200);
});

app.get('/register/:userID', function(req, res, next) {
    var userID = req.param('userID');
    runMap[userID] = {};
    res.send("", 200);
});

app.post('/set/:label/:filename', function(req, res) {
    var label = req.param('label');
    if ( !label ) {
        label = 'general';
    }
    var filename = req.param('filename');
    if ( !filename ) {
        console.log("Filename not provided!");
        res.sendStatus(400);
        return;
    }
    console.log("----------------------------------------")
    console.log("label:", label, "filename:", filename);
    console.log("content: ");
    console.log(req.text);

    var scriptID = label + "-" + filename;

    console.log("Registering", scriptID);

    // store the script
    scriptMap[scriptID] = req.text;

    // indicate that the script is ready to run
    // for all registered users
    for ( var userID in runMap ) {
        if ( runMap.hasOwnProperty(userID) ) {
            var userRunMap = runMap[userID];
            if ( !userRunMap ) {
                // lazily create the user program runMap
                userRunMap = {};
                runMap[userID] = userRunMap;
            }

            // flag the program as ready to run for the user (since its been updated)
            userRunMap[scriptID] = true;
        }
    }

    res.sendStatus(200);
});

app.listen(port);
