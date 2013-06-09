var path = require('path'),
    fs = require('fs');

var log = require('./lib/log'),
    gcj = require('grand-central-junction');

exports.App = GrandCentral;


function GrandCentral(app, dir, useORM) {
    if (!app) log.error("Express app not found");
    if (!dir) log.error("Project directory not found");

    this.useORM = (typeof useORM === 'boolean') ? useORM : true;
    this.app = app;
    this.dir = dir + '/';
    this.env = process.env.NODE_ENV || 'development';
    this.time = new Date();

    var self = this;
    app.getModels = function(cb) {
        if (self.useORM) {
            var ORM = require('./lib/orm');
            return new ORM().getModels(cb);
        } else return cb("ORM is not being used");
    };

    exports.Model = (self.useORM) ?
        require('./lib/orm').prototype.Model :
        function(model) {
            return { name: model.name };
        };
}

var fn = GrandCentral.prototype;


fn.route = function(options) {
    options = options || {};
    var self = this;

    if (this.useORM) {
        var ORM = require('./lib/orm');
        new ORM().getModels(function(models) {
            return gcj.route(self.app, {
                dir: self.dir,
                models: models
            });
        });
    } else return gcj.route(self.app, { dir: self.dir });
};

fn.pipeline = function(options) {
    options = options || {};

    var src  = path.join(this.dir, "client"),
        dest = path.join(this.dir, "assets", "javascripts"),
        ops = {
            source: src,
            dest: dest,
            templateDir: options.templateDir || 'templates'
        };

    if (options.minify) ops.minify = options.minify;
    if (options.force) ops.force = options.force;

    return require('grand-central-pipeline')(ops);
};



fn.uglify = fn.pipeline;
