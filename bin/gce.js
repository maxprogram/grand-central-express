#!/usr/bin/env node

var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    http = require('http'),
    exec = require('child_process').exec,
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

    var port = argv.p || app.get('port');

    http.createServer(app).listen(port, function(){
        console.log("Grand Central Express server listening on port " + port);
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
        report("error", "Please specify a project name");
        process.exit(1);
    }

    report('create', 'Grand Central Express app "' + appName + '"');

    report('create', 'package.json');
    var newPackage = require(tp('package.json'));
    newPackage.name = appName;
    newPackage.dependencies['grand-central-express'] = config.version();
    fs.writeFileSync(ap('package.json'), JSON.stringify(newPackage, null, 4));

    copyTemplate('app.js');
    copyTemplate('run.js');
    copyTemplate('Readme.md');
    copyTemplate('.gitignore');

    createFolder('config');
    copyTemplate('config/routes.js');

    createFolder('controllers');
    copyTemplate('controllers/home.js');

    createFolder('views');
    copyTemplate('views/index.ejs');

    createFolder('models');
    createFolder('assets');
    createFolder('assets/images');
    createFolder('assets/javascripts');
    createFolder('assets/stylesheets');
    copyTemplate('assets/stylesheets/styles.less');
    copyTemplate('assets/stylesheets/mixins.less');

    createFolder('client');
    copyTemplate('client/lib.js');
    copyTemplate('client/app.js');
    createFolder('client/models');
    createFolder('client/views');
    copyTemplate('client/views/app.js');
    createFolder('client/collections');
    createFolder('client/routers');
    createFolder('client/lib');
    copyTemplate('client/lib/jquery.js');
    copyTemplate('client/lib/underscore.js');
    copyTemplate('client/lib/backbone.js');

    // run npm install
    report('run', 'npm install');
    exec('npm install', function(err, stdout, stderr) {
        if (err) console.log(stderr);
        console.log(stdout);
    });
}

// Generates model or controller scaffolding
else if (argv._[0] && argv._[0].match(/^g$|^ge$|^gen$|^gene$|^gener$|^genera$|^generat$|^generate$/)) {
    // TODO
}


function createFolder(newPath) {
    //newPath = '/' + newPath;
    if (pathDoesntExist(ap(newPath))) {
        fs.mkdirSync(ap(newPath));
        report('create', newPath);
    } else report('exist', newPath);
}

function copyTemplate(file, options) {
    var replace = true;
    if (!options) replace = false;

    var template = fs.readFileSync(tp(file));

    if (replace) {}

    if (pathDoesntExist(ap(file))) {
        fs.writeFileSync(ap(file), template);
        report('create', file);
    } else report('exist', file);
}

function pathDoesntExist(p) {
    if (fs.existsSync(p)) return false;
    else return true;
}

function report(task, file) {
    var bold  = '\033[1m',
        blue  = '\033[34m',
        green = '\033[32m',
        red   = '\033[31m',
        reset = '\033[0m';

    function cols(txt) {
        var str = "", spaces = 12 - txt.length;
        for (var i = 0; i < spaces; i++) str += " ";
        return str += txt + "  ";
    }

    if (_.contains(['create','run'], task))
        console.log(bold + green + cols(task) + reset + file);
    else if (_.contains(['exist','identical'], task))
        console.log(bold + blue + cols(task) + reset + file);
    else if (_.contains(['conflict','error'], task))
        console.log(bold + red + cols(task) + reset + file);
}

function tp(file) {
    return path.join(tempDir, file);
}

function ap(file) {
    return path.join(appDir, file);
}
