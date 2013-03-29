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

    var db = this.getDatabaseUrl();
    this.orm = new ORM(dir, db[0], db[1]);
}

var fn = GrandCentral.prototype;


fn.route = function(routesPath, controllerPath, routeORM) {
    var app = this.app;

    routeORM = (routeORM === null) ? true : routeORM;
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

fn.getDatabaseUrl = function(dbFile) {
    dbFile = dbFile || 'config/db.json';
    dbFile = path.join(this.dir, dbFile);

    var db = require(dbFile)[this.env];

    if (db.adapter == "sqlite3") {
        db.adapter = "sqlite";
        db.host = db.username = db.password = "";
        db.database = path.join(this.dir, db.database);
    }

    var login = (db.username!=="") ? db.username + ":" + db.password + "@" : "",
        host = (db.host!=="") ? db.host + "/" : "",
        uri = db.adapter + "://" + login + host + db.database;

    return [db.adapter, uri];
};
