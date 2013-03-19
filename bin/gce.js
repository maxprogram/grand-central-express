#!/usr/bin/env node

var _       = require('underscore'),
    _str    = require('underscore.string'),
    fs      = require('fs'),
    path    = require('path'),
    http    = require('http'),
    exec    = require('child_process').exec,
    argv    = require('optimist').argv,
    ejs     = require('ejs'),
    config  = require('../lib/config');

var gcDir   = path.join(__dirname, ".."),
    tempDir = path.join(gcDir, "templates"),
    appDir  = path.join(process.cwd());

// Launches express server
if (argv._[0] && _.contains(['server', 's', 'start', 'run'], argv._[0])) {
    var app = path.join(appDir, "app.js"),
        isApp = fs.existsSync(app);
    if (!isApp) app = path.join(appDir, "index.js");

    var env = argv.e || argv.environment || argv.env || 'development';
    process.env.NODE_ENV = env;

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
    if (!appName) Error("Please specify a project name");

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

// Generates model/controller scaffolding
else if (argv._[0] && argv._[0].match(/^g$|^ge$|^gen$|^gene$|^gener$|^genera$|^generat$|^generate$/)) {
    // TODO
    if (!argv._[1]) Error("What should be generated?");

    else if (_.contains(['controller'], argv._[1])) {
        if (!argv._[2]) Error("Controller needs a name");
        var name = argv._[2], actions = argv._;
        actions.splice(0,3);
        generateController(name, actions);
    }
}

// Creates a new folder in the app
function createFolder(newPath) {
    if (pathDoesntExist(ap(newPath))) {
        fs.mkdirSync(ap(newPath));
        report('create', newPath);
    } else report('exist', newPath);
}

// Copies and renders a template file to the app
function copyTemplate(file, options) {
    var replace = true;
    if (!options) replace = false;

    var template = fs.readFileSync(tp(file));

    if (replace) {
        template = ejs.render("" + template, options);
        file = path.join(path.dirname(file), options.name + ".js");
    } else file = ap(file);

    if (pathDoesntExist(file)) {
        fs.writeFileSync(file, template);
        report('create', file);
    } else report('exist', file);
}

// Generates controller, actions, routes
function generateController(name, actions) {
    var routes = [];
    name = name.toLowerCase();
    actions.forEach(function(a) {
        a = a.toLowerCase();
        routes.push(["match", "/"+name+"/"+a, name+"#"+a]);
    });
    if (actions[0]) addRoutes(routes);

    copyTemplate('controllers/controller.js', { name: name, actions: actions });
}

// Adds routes to config/routes.js
function addRoutes(routes, x, y) {
    if (typeof routes === 'string') routes = [[routes, x, y]];
    if (typeof routes[0] === 'string') routes = [routes];

    var output = "";
    routes.forEach(function(r) {
        output += "\n    ";
        output += r[0] + "('" + r[1] + "', '" + r[2] + "');";
    });

    var routesOld = "" + fs.readFileSync(ap('config/routes.js'));

    var module = routesOld.match(/module.ex.+{/)[0],
        newline = module + output,
        routesNew = routesOld.replace(/module.ex.+{/, newline);

    fs.writeFileSync(ap('config/routes.js'), routesNew);
    report('update', 'routes');
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
    else if (_.contains(['exist','identical','update'], task))
        console.log(bold + blue + cols(task) + reset + file);
    else if (_.contains(['conflict','error'], task))
        console.log(bold + red + cols(task) + reset + file);
}

function Error(msg) {
    report('error', msg);
    process.exit(1);
}

function tp(file) {
    return path.join(tempDir, file);
}

function ap(file) {
    return path.join(appDir, file);
}
