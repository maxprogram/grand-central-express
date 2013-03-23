/* ORM Adapter
 * This is essentially an adapter for the ORM library or
 * any other future ORMs used. If the ORM is ever updated
 * or switched, this is all that has to be changed.
 */

var path = require('path'),
    fs = require('fs'),
    _ = require('underscore');

module.exports = ORM;

function ORM(dir, adapter, uri) {
    this.dir = dir;
    this.adapter = adapter;
    this.uri = uri;
}

var fn = ORM.prototype;

fn.getModels = function(callback) {
    var orm = require('orm'),
        _this = this,
        uri = this.uri,
        dir = path.join(this.dir, 'models');

    // TODO: Switch between ORM & Mongoose if using MongoDB?
    orm.connect(uri, function(err, db) {
        if (err) throw "Database connection error: " + err;
        var models = {};

        fs.readdirSync(dir).forEach(function(model) {
            var m = require(path.join(dir, model))(orm.validators),
                name = m.name.toLowerCase();
            models[m.name] = _this.defineModel(db, m);
        });

        callback(models);
    });
};

fn.defineModel = function(db, model) {
    var name = model.name.toLowerCase(),
        methods = model.methods || {},
        validations = model.validations || {},
        rels = model.relationships || [];

    var Model = db.define(name, model.schema, {
        methods: methods,
        validations: validations
    });

    rels.forEach(function(r) {
        r = r.split(" ");
        if (_.contains(['hasMany', 'has_many'], r[0])) {
            Model.hasMany(r[1], r[1]);
        } else if (_.contains(['hasOne', 'has_one'], r[0])) {
            Model.hasOne(r[1], r[1]);
        }
    });

    // Add-ons & aliases for ORM library
    Model.findById = Model.get;
    Model.migrate = Model.sync;
    Model.all = function(cb) {
        return Model.find(cb);
    };

    return Model;
};
