// Custom ORM that connects with MySQL, Postgres, SQLite3, MongoDB

var _    = require('underscore'),
    _str = require('underscore.string'),
    path = require('path');


///////////////////////////////////////


var ORM = function(connection, table, options){

    var verbose = options.verbose || false;

    var adapter;
    this.adapter = adapter = connection.adapter;

    if (_.contains(['postgres','pg','postgresql'], adapter)) {
        this.adapter = "pg";
        var Postgres = require('./adapters/pg');
        this.engine = new Postgres(connection);

    } else if (_.contains(['mysql','mySQL','MySQL'], adapter)) {
        this.adapter = "mysql";
        var Mysql = require('./adapters/mysql');
        this.engine = new Mysql(connection);

    } else if (_.contains(['sqlite','sqlite3'], adapter)) {
        this.adapter = "sqlite";
        if (connection.database != ':memory:')
            connection.database = path.join(connection.dir, connection.database);
        var Sqlite = require('./adapters/sqlite');
        this.engine = new Sqlite(connection);

    } else {
        return new Error("ORM Error: Adapter missing or not recognized");
    }

    this.verbose = verbose;
    this.table = table;
    this.idField = options.idAttribute || (this.adapter=="pg") ? "gid" : "id";
    this.values = null;
    this.q = {
        action: "SELECT *",
        from: "FROM " + table,
        where: "",
        others: {
            orderBy: "",
            limit: "",
            offset: "",
            returning: ""
        }
    };
};

var fn = ORM.prototype;

module.exports = ORM;

///////////////////////////////////////

fn._buildQuery = function() {
    var other = "" +
        this.q.others.orderBy +
        this.q.others.limit +
        this.q.others.offset +
        this.q.others.returning;

    return _str.clean(this.q.action + " " +
           this.q.from + " " +
           this.q.where + " " +
           other);
};

fn.query = function(callback) {
    var engine = this.engine,
        query = (this.verbose) ?
            {sql: this._buildQuery(), verbose: true} :
            this._buildQuery();

    var newCallback = function(err,res,fields){
        if (err) callback(err);
        else {
            if (Array.isArray(res)) {
                res = (res.length > 1) ? res : res[0];
            }

            // TODO: return model object(s) with data, methods
            var object = res;
            callback(null, object);
        }
    };

    var values = this.values;
    if (!values) values = newCallback;

    engine.query(query, values, newCallback);
};

fn.run = function(callback) {
    this.query(callback);
};

///////////////////////////////////////

fn.select = function(columns, callback) {

    // USAGE: #select(column string | [columns])

    // Join & add table name to columns
    var _this = this;
    if (Array.isArray(columns)) {
        columns = columns.map(function(col) {
            return _this.table + '.' + col;
        });
        columns = columns.join(", ");
    } else columns = this.table + '.' + columns;

    this.q.action = "SELECT " + columns;

    if (callback) this.query(callback);
    else return this;

};

fn.where = function(conditions,values,callback) {

    // USAGE: #where(expression string)
    // USAGE: #where(expression string %n, [values])
    // USAGE: #where({column: value, ..})

    var engine = this.engine;

    if (typeof conditions === "object") {
        if (values) callback = values;
        var keys = Object.keys(conditions), conds = [];
        keys.forEach(function(key){
            conds.push(key+" = '"+conditions[key]+"'");
        });
        conditions = conds.join(" AND ");
    } else if (typeof values === "object"){
        values.forEach(function(v,i){
            i++;
            v = engine.escape(v);
            conditions = conditions.replace(new RegExp("%"+i,"g"),v);
        });
    } else callback = values;

    this.q.where = "WHERE " + conditions;
    if (callback) this.query(callback);
    else return this;

};

fn.all = function(callback) {
    if (callback) this.query(callback);
    else return this;
};

fn.find = function(id, callback) {

    // USAGE: #find(id int | [ids])

    if (Array.isArray(id)) id = id.join(",");
    return this.where(this.idField + ' IN (%1)',[id],callback);
};

fn.order = function(orderBy, callback) {

    // USAGE: #order(column DESC|ASC string)

    this.q.others.orderBy = " ORDER BY " + orderBy;
    if (callback) this.query(callback);
    else return this;
};

fn.limit = function(num, callback){

    // USAGE: #limit(int)

    this.q.others.limit = " LIMIT " + num;
    if (callback) this.query(callback);
    else return this;
};

fn.offset = function(num, callback) {

    // USAGE: #offset(int)

    this.q.others.offset += " OFFSET " + num;
    if (this.q.others.limit === "") this.q.others.limit = "9223372036854775807";

    if (callback) this.query(callback);
    else return this;
};

fn._cleanData = function(data) {
    var keys = Object.keys(data),
        engine = this.engine,
        dataOnly = [];

    keys.forEach(function(key,i){
        var d = engine.escape(data[key]);
        dataOnly[i] = d;
    });

    return {keys: keys,
            data: dataOnly,
            keyStr: keys.join(","),
            dataStr: dataOnly.join(",")};
};

fn.insert = function(data, callback) {

    // USAGE: #insert({column: value, ..})

    this.q.from = "";
    if (this.adapter == "pg") {
        data = this._cleanData(data);
        this.q.action = "INSERT INTO "+this.table+" ("+data.keyStr+") VALUES("+data.dataStr+")";
        this.q.others.returning = " RETURNING " + this.idField;

    } else if (this.adapter == "mysql") {
        this.q.action = "INSERT INTO "+this.table+" SET ?";
        this.values = data;

    } else if (this.adapter == "sqlite") {
        data = this._cleanData(data);
        this.q.action = "INSERT INTO "+this.table+" ("+data.keyStr+") VALUES("+data.dataStr+")";
    }

    if (callback) this.query(callback);
    else return this;
};

fn.update = function(id, data, callback) {

    // USAGE: #update(id int, {column: value, ..})
    // USAGE: #update({column: value, ..}).where()

    var where = true;

    if (typeof id === "object"){
        if (data) callback = data;
        data = id;
        where = false;
    }

    this.q.from = "";
    if (this.adapter == "mysql") {
        this.q.action = "UPDATE "+this.table+" SET ?";
        this.values = data;

    } else if (this.adapter == "pg") {
        data = this._cleanData(data);
        this.q.action = "UPDATE "+this.table+" SET ("+data.keyStr+") = ("+data.dataStr+")";

    } else if (this.adapter == "sqlite") {
        var changes = [];
        data = this._cleanData(data);
        data.keys.forEach(function(key,i){
            changes.push(key + ' = ' + data.data[i]);
        });
        this.q.action = "UPDATE "+this.table+" SET "+changes.join(', ');
    }

    if (where) this.q.where += "WHERE "+this.idField+" = "+id;
    if (callback) this.query(callback);
    else return this;
};

fn.remove = function(id, callback) {

    // USAGE: #remove(id int)
    // USAGE: #remove().where()

    var where = false;

    if (typeof id === "number") where = true;

    this.q.action = "DELETE";
    if (where) this.q.where += "WHERE "+this.idField+" = "+id;
    if (callback) this.query(callback);
    else return this;
};

fn.sync = function(data, callback) {
    if (!this.engine.sync) return new Error("Sync doesn't exist for this adapter");
    this.engine.sync(this.table, data, callback);
};


// Aliases

fn.findByIdAndUpdate = function(id, data, callback) {
    return this.update(id, data, callback);
};

fn.findByIdAndRemove = function(id, callback) {
    return this.remove(id, callback);
};

fn.create = function(data, callback) {
    return this.insert(data, callback);
};
