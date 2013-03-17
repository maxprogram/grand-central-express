#!/usr/bin/env node

var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    http = require('http'),
    argv = require('optimist').argv,
    config = require('../lib/config');

var gcDir   = path.join(__dirname, ".."),
    tempDir = path.join(gcDir, "templates"),
    appDir  = path.join(process.cwd());

// Launches express server
if (argv._[0] && _.contains(['server', 's', 'start', 'run'], argv._[0])) {
    var app = path.join(appDir, "app.js"),
        isApp = fs.existsSync(app);
    if (!isApp) app = path.join(appDir, "index.js");
    app = require(app);

    http.createServer(app).listen(app.get('port'), function(){
        console.log("Grand Central Express server listening on port " + app.get('port'));
    });
}

// Gets version
else if (argv.v || argv.version || (argv._[0] && _.contains(['v', 'version'], argv._[0]))) {
    console.log('v' + config.version());
}

// Create new app scaffolding
else if (argv._[0] && _.contains(['new'], argv._[0])) {
    var appName = argv._[1];
    if (!appName) {
        console.log("Please specify a project name");
        process.exit(1);
    }

    console.log('Building new Grand Central Express app "' + appName + '"');
    // TODO
}

// Generates model or controller scaffolding
else if (argv._[0] && argv._[0].match(/^g$|^ge$|^gen$|^gene$|^gener$|^genera$|^generat$|^generate$/)) {
    // TODO
}
