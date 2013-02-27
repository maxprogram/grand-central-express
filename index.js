var Router = require('./lib/router');

module.exports = GrandCentral;

function GrandCentral(app, dir) {
    this.app = app;
    this.dir = dir + '/';
}

var fn = GrandCentral.prototype;


fn._cleanPath = function(path) {
    return path.replace(/\s/g, '')
               .replace(/^\/|\/$/, '');
};

fn.routes = function(routesPath, controllerPath) {
    routesPath = this.dir + this._cleanPath(routesPath) || "config/routes";
    controllerPath = this.dir + this._cleanPath(controllerPath) || "controllers";

    return new Router(this.app, routesPath, controllerPath);
};