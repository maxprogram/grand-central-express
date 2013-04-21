/* ORM Adapter
 * This is essentially an adapter for the ORM library or
 * any other future ORMs used. If the ORM is ever updated
 * or switched, this is all that has to be changed.
 */

var path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    log = require('./log'),
    Adapter = require('./orm/index');


function ORM(dir, dbJSON, env) {
    this.dir = dir;
    this.db = dbJSON;
    this.env = env;
}

module.exports = ORM;
var fn = ORM.prototype;


fn.getModels = function(callback) {
    var _this = this,
        models = {},
        dir = path.join(this.dir, 'models');

    fs.readdirSync(dir).forEach(function(model) {
        var m = require(path.join(dir, model))(),
            dbName = m.database || _this.env,
            db = _this.db[dbName];

        if (!db) log.error('Database "'+dbName+'" not found in db.json (Model: '+m.name+')');

        models[m.name] = _this.defineModel(db, m);
    });
    callback(models);
};

fn.defineModel = function(db, model) {
    var name = model.name.toLowerCase(),
        methods = model.methods || {},
        validations = model.validations || {},
        rels = model.relationships || [],
        idAttribute = model.idAttribute || null,
        verbose = (this.env=='development') ? true : false;

    db.dir = this.dir;

    var Model = new Adapter(db, name, {
        verbose: verbose,
        idAttribute: idAttribute
    });

    /*
    rels.forEach(function(r) {
        r = r.split(" ");
        if (_.contains(['hasMany', 'has_many'], r[0])) {
            Model.hasMany(r[1]);
        } else if (_.contains(['hasOne', 'has_one'], r[0])) {
            Model.hasOne(r[1]);
        }
    });
    */

    return Model;
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
