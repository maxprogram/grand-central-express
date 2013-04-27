var path = require('path'),
    fs = require('fs');

var log = require('./lib/log'),
    Router = require('./lib/router'),
    ORM = require('./lib/orm');

exports.App = GrandCentral;
exports.ActiveRecord = ORM.prototype.ActiveRecord;

function GrandCentral(app, dir) {
    if (!app) log.error("Express app not found");
    if (!dir) log.error("Project directory not found");

    this.app = app;
    this.dir = dir + '/';
    this.env = process.env.NODE_ENV || 'development';
    this.time = new Date();
    this.orm = new ORM();
}

var fn = GrandCentral.prototype;


fn.route = function(options) {
    options = options || {};

    var app = this.app,
        routesPath = options.routes || "config/routes",
        controllerPath = options.controllers || "controllers",
        orm = (options.hasOwnProperty("orm")) ? options.orm : true;

    routesPath = path.join(this.dir, routesPath);
    controllerPath = path.join(this.dir, controllerPath);

    if (orm && this.orm) this.orm.getModels(function(models) {
        return new Router(app, routesPath, controllerPath, models);
    });
    else return new Router(app, routesPath, controllerPath, null);
};

fn.uglify = function() {
    var src  = path.join(this.dir, "client"),
        dest = path.join(this.dir, "assets", "javascripts"),
        minify = (this.env == 'development') ? false : true;
    return require('./lib/uglify')({
        src: src,
        dest: dest,
        minify: minify,
        time: this.time
    });
};
