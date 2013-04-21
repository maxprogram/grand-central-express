var path = require('path'),
    fs = require('fs');

var Router = require('./lib/router'),
    ORM = require('./lib/orm');

module.exports = GrandCentral;

function GrandCentral(app, dir) {
    this.app = app;
    this.dir = dir + '/';
    this.env = process.env.NODE_ENV || 'development';
    this.time = new Date();

    var dbJSON = require(path.join(this.dir, 'config/db.json'))[this.env];
    this.orm = new ORM(dir, dbJSON, this.env);
}

var fn = GrandCentral.prototype;


fn.route = function(routesPath, controllerPath, routeORM) {
    var app = this.app;

    routeORM = (!routeORM) ? true : routeORM;
    routesPath = routesPath || "config/routes";
    controllerPath = controllerPath || "controllers";
    routesPath = path.join(this.dir, routesPath);
    controllerPath = path.join(this.dir, controllerPath);

    if (routeORM) this.orm.getModels(function(models) {
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
