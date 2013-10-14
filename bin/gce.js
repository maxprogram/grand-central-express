#!/usr/bin/env node

var _       = require('underscore'),
    _str    = require('underscore.string'),
    fs      = require('fs'),
    path    = require('path'),
    http    = require('http'),
    exec    = require('child_process').exec,
    argv    = require('optimist').argv,
    ejs     = require('ejs'),
    log     = require('../lib/log'),
    config  = require('../lib/config'),
    GCE     = require('../index.js');

var gcDir   = path.join(__dirname, ".."),
    tempDir = path.join(gcDir, "templates"),
    appDir  = path.join(process.cwd());

// Launches express server
if (argv._[0] && _.contains(['server', 's', 'start', 'run'], argv._[0])) {
    appDir = path.resolve(appDir, argv._[1]);
    var app = path.join(appDir, "app.js"),
        isApp = fs.existsSync(app);

    if (!isApp || !require(app).get) return log.error('app.js not found!');

    var env = argv.e || argv.environment || argv.env || 'development';
    process.env.NODE_ENV = env;

    app = require(app);
    var port = argv.p || app.get('port');

    http.createServer(app).listen(port, function(){
        log.log("Grand Central Express server listening on port " + port);
    });
}

// Gets version
else if (argv.v || argv.version || (argv._[0] && _.contains(['v', 'version'], argv._[0]))) {
    log.log('v' + config.version());
}

// Migrate models to database
else if (argv._[0] && _.contains(['migrate', 'mig'], argv._[0])) {
    var env = argv.env || argv.e || argv.environment || 'development';
    process.env.NODE_ENV = env;

    var app = require(path.join(appDir, 'app.js'));
    app.getModels(function(models) {
        // Iterates over & syncs available models
        _.keys(models).forEach(function(i) {
            /*
            models[i].migrate(function(err) {
                if (err) Error(err);
                report('migrate', i);
            });
            */
        });
    });
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
    copyTemplate('gitignore');

    createFolder('config');
    copyTemplate('config/routes.js');
    copyTemplate('config/db.json');

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
    copyTemplate('client/views/appView.js');
    createFolder('client/collections');
    createFolder('client/routers');
    copyTemplate('client/routers/router.js');
    createFolder('client/templates');
    createFolder('client/lib');
    copyTemplate('client/lib/jquery.js');
    copyTemplate('client/lib/underscore.js');
    copyTemplate('client/lib/backbone.js');
    copyTemplate('client/lib/gce.js');

    // run npm install
    report('run', 'npm install');
    exec('npm install', function(err, stdout, stderr) {
        if (err) console.log(stderr);
        console.log(stdout);
    });
}

// Generates model/controller scaffolding
else if (argv._[0] && argv._[0].match(/^g$|^ge$|^gen$|^gene$|^gener$|^genera$|^generat$|^generate$/)) {
    if (!argv._[1]) Error("What should be generated?");

    else if (_.contains(['controller'], argv._[1])) {
        if (!argv._[2]) Error("Controller needs a name");
        var cName = argv._[2], actions = argv._;
        actions.splice(0,3);
        generateController(cName, actions);
    }

    else if (_.contains(['model'], argv._[1])) {
        if (!argv._[2]) Error("Model needs a name");
        var mName = argv._[2], cols = argv._;
        cols.splice(0,3);
        generateModel(mName, cols);
    }

    else if (_.contains(['scaffold'], argv._[1])) {
        if (!argv._[2]) Error("Model needs a name");
        var mName = argv._[2], cols = argv._;
        cols.splice(0,3);
        generateScaffold(mName, cols);
        if (!argv.c) generateBBScaffold(mName, cols);
    }

    else Error("Generator not recognized");
}

// Generates Backbone templates
else if (argv._[0] && _.contains(['backbone', 'bb'], argv._[0])) {
    if (!argv._[1]) Error("What should be generated?");

    else if (_.contains(['model', 'collection', 'scaffold'], argv._[1])) {
        if (!argv._[2]) Error("Model needs a name");
        var mName = argv._[2], cols = argv._;
        cols.splice(0,3);
        generateBBScaffold(mName, cols);
    }

    else if (_.contains(['view'], argv._[1])) {
        if (!argv._[2]) Error("View needs a name");
        generateBBView(argv._[2]);
    }

    else Error("Generator not recognized");
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
        var end = options.end || "";
        template = ejs.render("" + template, options);
        file = path.join(path.dirname(file), options.name + end + ".js");
    }

    if (file == "gitignore") file = ".gitignore";
    var filePath = ap(file);
    if (pathDoesntExist(filePath)) {
        fs.writeFileSync(filePath, template);
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

// Generates model
function generateModel(name, fields) {
    name = _str.capitalize(name);
    var schema = [];
    fields.forEach(function(c) {
        c = c.toLowerCase();
        schema.push(c.split(":"));
    });
    schema.push(["created_at","date"]);
    schema.push(["updated_at","date"]);

    copyTemplate('models/model.js', { name: name, fields: schema });
}

// Generates scaffolding
function generateScaffold(name, fields) {
    generateModel(name, fields);
    name = name.toLowerCase();
    copyTemplate('controllers/crud.js', { name: name });
    addRoutes(["resources", "/" + name, name]);
}

// Generate Backbone scaffold
function generateBBScaffold(name, fields) {
    name = name.toLowerCase();
    var nameUC = _str.capitalize(name);
    var schema = [];
    fields.forEach(function(c) {
        c = c.toLowerCase();
        schema.push(c.split(":"));
    });

    copyTemplate('client/models/model.js', { name: nameUC, fields: schema, nameLC: name });
    copyTemplate('client/collections/collection.js', { name: name, end: 'List' });
}

// Generate Backbone view
function generateBBView(name) {
    name = name.toLowerCase();
    copyTemplate('client/views/view.js', { name: name, end: 'View' });
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
    return log.generator(task, file);
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
