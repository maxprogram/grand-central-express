/* ORM Adapter
 * This is essentially an adapter for the ORM library or
 * any other future ORMs used. If the ORM is ever updated
 * or switched, this is all that has to be changed.
 */

var path    = require('path'),
    fs      = require('fs'),
    _       = require('underscore'),
    log     = require('./log'),
    Adapter = require('./orm/index');


function ORM() {
    this.dir = process.cwd();
    this.env = process.env.NODE_ENV || 'development';
}

module.exports = ORM;
var fn = ORM.prototype;

function getConfig(database, dir, env) {
    var dbName = database || env,
        configFile = path.join(dir, 'config/db.json');

    if (!fs.existsSync(configFile)) {
        log.error("No database configuration found (config/db.json)");
    } else {
        connection = require(configFile)[dbName];
        if (!connection) log.error('Database "'+dbName+'" not found in db.json (Model: '+model.name+')');
        connection.dir = dir;
        return connection;
    }
}

function ActiveRecord(connection, model) {
    var dir = process.cwd(),
        env = process.env.NODE_ENV || 'development';

    if (connection.hasOwnProperty("name") && !connection.hasOwnProperty("adapter")) {
        // Only model included; get default connection
        model = connection;
        connection = _.extend({}, getConfig(model.database, dir, env));
        model.verbose = model.verbose || (env=='development') ? true : false;
        return new Adapter(connection, model);
    } else {
        // Connection present; use it
        connection.dir = connection.dir || dir;
        model.verbose = model.verbose || (env=='development') ? true : false;
        return new Adapter(connection, model);
    }
    connection = model = null;
}

fn.ActiveRecord = ActiveRecord;

fn.getModels = function(callback) {
    var _this = this,
        models = {},
        dir = path.join(this.dir, 'models');

    fs.readdirSync(dir).forEach(function(model) {
        var m = require(path.join(dir, model));
        models[m.name] = m;
    });
    callback(models);
};

fn.getDatabaseUrl = function(db) {
    if (db.adapter == "sqlite3") {
        db.adapter = "sqlite";
        db.host = db.username = db.password = "";
        db.database = path.join(this.dir, db.database);
    }

    var login = (db.username!=="") ? db.username + ":" + db.password + "@" : "",
        host = (db.host!=="") ? db.host + "/" : "",
        uri = db.adapter + "://" + login + host + db.database;

    return uri;
};
