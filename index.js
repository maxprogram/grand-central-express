var Router = require('./lib/router');

module.exports = GrandCentral;

function GrandCentral(app, dir) {
    this.app = app;
    this.dir = dir + '/';
}

var fn = GrandCentral.prototype;


fn._cleanPath = function(path) {
    if (!path) return undefined;
    return path.replace(/\s/g, '')
               .replace(/^\/|\/$/, '');
};

fn.route = function(routesPath, controllerPath) {
    routesPath = this._cleanPath(routesPath) || "config/routes";
    controllerPath = this._cleanPath(controllerPath) || "controllers";
    routesPath = this.dir + routesPath;
    controllerPath = this.dir + controllerPath;

    return new Router(this.app, routesPath, controllerPath);
};