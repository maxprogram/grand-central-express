// Custom ORM that connects with MySQL, Postgres, SQLite3, MongoDB


// NONE OF THE CODE BELOW ACTUALLY WORKS
/////////////////////

var Table = function(table){
    this.table = table;
    this.q = {
        action: "SELECT *",
        from: "FROM " + table,
        where: "",
        other: ""
    };
};

var tfn = Table.prototype;

fn.table = function(t){
    return new Table(t);
};

fn.t = function(t){
    return new Table(t);
};

fn.polygon = function(id,callback){
    var table = new Table("polygon");
    if (callback) table.find(id,callback);
    else return table.find(id);
};

fn.point = function(id,callback){
    var table = new Table("point");
    if (callback) table.find(id,callback);
    else return table.find(id);
};

fn.line = function(id,callback){
    var table = new Table("line");
    if (callback) table.find(id,callback);
    else return table.find(id);
};

/////////////////////

tfn.buildQuery = function() {
    return this.q.action + " " +
           this.q.from + " " +
           this.q.where + " " +
           this.q.other;
};

tfn.query = function(callback) {
    var pg = module.exports;
    pg.query(this.buildQuery(), function(err,res){
        if (err) callback(err);
        else callback(null, (res.rows.length>1) ? res.rows : res.rows[0], res.rowCount);
    });
};

tfn.run = function(callback) {
    this.query(callback);
};

tfn.select = function(columns,callback){

    if (typeof columns === "object") columns = columns.join(",");
    this.q.action = "SELECT " + columns;

    if (callback) this.query(callback);
    else return this;

};

tfn.where = function(conditions,values,callback){

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
            conditions = conditions.replace(new RegExp("%"+i,"g"),v);
        });
    } else callback = values;

    this.q.where = "WHERE " + conditions;
    if (callback) this.query(callback);
    else return this;

};

tfn.all = function(callback){
    if (callback) this.query(callback);
    else return this;
};

tfn.find = function(id,callback){
    if (typeof id === "object") id = id.join(",");
    return this.where('gid IN (%1)',[id],callback);
};

tfn.order = function(orderBy,callback){
    this.q.other += " ORDER BY " + orderBy;
    if (callback) this.query(callback);
    else return this;
};

tfn.limit = function(int,callback){
    this.q.other += " LIMIT " + int;
    if (callback) this.query(callback);
    else return this;
};

tfn.offset = function(int,callback){
    this.q.other += " OFFSET " + int;
    if (callback) this.query(callback);
    else return this;
};

tfn.returning = function(col,callback){
    this.q.other += " RETURNING " + col;
    if (callback) this.query(callback);
    else return this;
};

tfn._cleanData = function(data){
    var keys = Object.keys(data),
        pg   = module.exports, dataOnly = [];
    keys.forEach(function(key){
        var d = pg.escape(key,data[key]);
        dataOnly.push(d);
    });
    return {keys: keys,
            data: dataOnly,
            keyStr: keys.join(","),
            dataStr: dataOnly.join(",")};
};

tfn.insert = function(data,callback){
    data = this._cleanData(data);
    this.q.action = "INSERT INTO "+this.table+" ("+data.keyStr+") VALUES("+data.dataStr+")";
    this.q.from = "";
    if (callback) this.query(callback);
    else return this;
};

tfn.update = function(id,data,callback){
    var where = true;
    if (typeof id === "object"){
        if (data) callback = data;
        data = id;
        where = false;
    }
    data = this._cleanData(data);

    this.q = "UPDATE "+this.table+" SET ("+data.keyStr+") = ("+data.dataStr+")";
    this.q.from = "";
    if (where) this.q.where += " WHERE gid = "+id;
    if (callback) this.query(callback);
    else return this;
};

tfn.remove = function(id,callback){
    var where = false;
    if (typeof id === "number") where = true;

    this.q.action = "DELETE";
    if (where) this.q.where += "WHERE gid = "+id;
    if (callback) this.query(callback);
    else return this;
};

tfn.getColumns = function(callback){
    var pg = module.exports;
    pg.query(["SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='%1'",this.table], function(err,res){
        if (err) callback(err);
        else {
            var cols = [];
            res.rows.forEach(function(col){ cols.push(col.column_name); });
            callback(null,cols);
        }
    });
};

