var path = require('path');

var Router = require('./lib/router'),
    uglify = require('./lib/uglify');

module.exports = GrandCentral;

function GrandCentral(app, dir) {
    this.app = app;
    this.dir = dir + '/';
    this.env = process.env.NODE_ENV || 'development';
}

var fn = GrandCentral.prototype;


fn.route = function(routesPath, controllerPath) {
    routesPath = routesPath || "config/routes";
    controllerPath = controllerPath || "controllers";
    routesPath = path.join(this.dir, routesPath);
    controllerPath = path.join(this.dir, controllerPath);

    return new Router(this.app, routesPath, controllerPath);
};

fn.uglify = function() {
    var src  = path.join(this.dir, "client"),
        dest = path.join(this.dir, "assets", "javascripts"),
        minify = (this.env == 'development') ? false : true;
    return uglify({
        src: src,
        dest: dest,
        minify: minify
    });
};
