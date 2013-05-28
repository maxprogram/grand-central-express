/* ORM Adapter
 * This is essentially an adapter for the ORM library or
 * any other future ORMs used. If the ORM is ever updated
 * or switched, this is all that has to be changed.
 */

var path    = require('path'),
    fs      = require('fs'),
    _       = require('underscore'),
    log     = require('../log'),
    GCR     = require('grand-central-records');


function ORM() {
    this.dir = process.cwd();
    this.env = process.env.NODE_ENV || 'development';
}

module.exports = ORM;
var fn = ORM.prototype;

function getConnection(model) {
    var dir = process.cwd(),
        env = process.env.NODE_ENV || 'development',
        dbName = model.database || env,
        configFile = path.join(dir, 'config/db.json');

    if (!fs.existsSync(configFile)) {
        log.error("No database configuration found (config/db.json)");
    } else {
        connection = require(configFile)[dbName];
        if (!connection) log.error('Database "'+dbName+'" not found in db.json (Model: '+model.name+')');
        connection.dir = dir;
        return _.extend({}, connection);
    }
}

// getModels must return a hash of available models to callback

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

// Model must return the actual ORM object (with a 'name' property)

fn.Model = function (model) {
    var connection = getConnection(model),
        options = {},
        newName = model.name.toLowerCase().replace(/\s/g,''),
        table = model.table || newName;

    options.verbose = model.verbose || (this.env == 'development') ? true : false;
    if (model.hasOwnProperty("idAttribute")) options.idAttribute = model.idAttribute;

    var adapter = new GCR(connection, table, options);
    adapter.name = model.name;

    return adapter;
};
