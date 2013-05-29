var path = require('path'),
    fs = require('fs');

var log = require('./lib/log'),
    gcj = require('grand-central-junction'),
    ORM = require('./lib/orm');

exports.App = GrandCentral;
exports.Model = ORM.prototype.Model;

function GrandCentral(app, dir) {
    if (!app) log.error("Express app not found");
    if (!dir) log.error("Project directory not found");

    this.app = app;
    this.dir = dir + '/';
    this.env = process.env.NODE_ENV || 'development';
    this.time = new Date();
    this.orm = new ORM();

    var self = this;
    app.getModels = function(cb) {
        if (self.useORM) return self.orm.getModels(cb);
        else return cb("ORM is not being used");
    };
}

var fn = GrandCentral.prototype;


fn.route = function(options) {
    options = options || {};
    var self = this;

    if (this.useORM) this.orm.getModels(function(models) {
        return gcj.route(self.app, {
            dir: self.dir,
            models: models
        });
    });
    else return gcj.route(self.app, { dir: self.dir });
};

fn.pipeline = function(options) {
    options = options || {};

    var src  = path.join(this.dir, "client"),
        dest = path.join(this.dir, "assets", "javascripts"),
        ops = {
            source: src,
            dest: dest
        };

    if (options.minify) ops.minify = options.minify;
    if (options.force) ops.force = options.force;

    return require('grand-central-pipeline')(ops);
};

fn.uglify = fn.pipeline;
