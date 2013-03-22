var path = require('path'),
    fs = require('fs');

var Router = require('./lib/router');

module.exports = GrandCentral;

function GrandCentral(app, dir) {
    this.app = app;
    this.dir = dir + '/';
    this.env = process.env.NODE_ENV || 'development';
}

var fn = GrandCentral.prototype;


fn.route = function(routesPath, controllerPath, orm) {
    var app = this.app;

    orm = orm || true;
    routesPath = routesPath || "config/routes";
    controllerPath = controllerPath || "controllers";
    routesPath = path.join(this.dir, routesPath);
    controllerPath = path.join(this.dir, controllerPath);

    if (orm) this.getORM(function(models) {
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
        minify: minify
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

    return [uri, db.adapter];
};

fn.getORM = function(callback) {
    var orm = require('orm'),
        uri = this.getDatabaseUrl()[0],
        dir = path.join(this.dir, 'models');

    // TODO: Switch between ORM & Mongoose if using MongoDB
    orm.connect(uri, function(err, db) {
        if (err) throw err;
        var models = {};

        fs.readdirSync(dir).forEach(function(model) {
            var m = require(path.join(dir, model))(orm.validators),
                name = m.name.toLowerCase();
            models[m.name] = db.define(name, m.schema, {
                methods: m.methods,
                validations: m.validations
            });
        });

        callback(models);
    });
};
