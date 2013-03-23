
var config = require('./config'),
    pg = require('pg'),
    Step = require('step');

var fn = Postgres.prototype;
module.exports = new Postgres();

function Postgres(){
    this.options = {
        host: config.host,
        user: config.username,
        password: config.password,
        database: config.database
    };
    this.q = "";
}


fn.query = function (sql,values,cb){

    var client, verbose = false, self = this;

    if (sql.verbose){
        sql = sql.sql;
        verbose = true;
    }

    Step(function connect(){
        var Client = pg.Client;
        client = new Client(self.options);
        client.connect(this);

    }, function runQueries(err,client){
        if (err) throw err;

        if (typeof sql === 'object' && sql.text) {
        // query({options}, cb)
            cb = values;
            if (verbose) console.log("Executing object: "+sql);
            client.query(sql, this);

        } else if (typeof values === 'function' && typeof sql === 'string') {
        // query(sql, cb)
            cb = values;
            if (verbose) console.log("Executing single: "+sql);
            client.query(sql, this);

        } else if (typeof sql === 'object') {
        // query([sql, sql], cb)
            var group = this.group();
            cb = values;
            for (var i=1; i < sql.length; i++)
                sql[0] = sql[0].replace(new RegExp("%"+i,"g"),sql[i]);
            sql = sql[0].split(";");

            for (var n in sql){
                if (sql[n]!=="") {
                    if (verbose) console.log("Executing ("+n+"): "+sql[n]);
                    client.query(sql[n], group());
                }
            }
        }
        // query(sql, values, cb)
        else client.query(sql, values, this);

    }, function finish(err, results){
        client.end();
        if (verbose) console.log("All queries executed, connection ended");
        if (results && results.length==1) results = results[0];
        cb(err, results);
    });

};

fn.queryVerbose = function(sql, values, cb){
    this.query({sql: sql, verbose: true}, values, cb);
};

fn.queue = function(str,values){
    if (values) values.forEach(function(v,i){
        i++;
        str = str.replace(new RegExp("%"+i,"g"),v);
    });
    this.q += str + ";";
    return this;
};

fn.execute = function(callback){
    this.query([this.q],callback);
    this.q = "";
};

fn.run = function(callback){
    this.query([this.q],callback);
    this.q = "";
};

fn.escape = function(key,d){
    if (d===undefined || d===null) d = "NULL";
    else if (typeof d==="boolean") d = (d) ? 'true':'false';
    else if (typeof d==="number")  d = d+"";
    else if (typeof d==="string")  d = "'"+d.replace(/\'/g,"")+"'";
    else if (Array.isArray(d))     d = "'{"+d.join(",")+"}'";
    else if (typeof d==="object"){
        var command = Object.keys(d)[0], val = d[command];
        switch(command){
            case "geom"   : d = "ST_GeomFromText('"+val+"',4326)"; break;
            case "concat" :
                if (Array.isArray(val)) val = val.join("::int8,");
                if (val !== null) d = key+" || ARRAY["+val+"::int8]";
                else d = key+'';
                break;
            case "extract": d = "extract_bigint("+key+","+val+")"; break;
            default: d = val+'';
        }
    }
    return d;
};

fn.newTable = function(name,columns,callback){
    var keys = Object.keys(columns), cols = [];
    keys.forEach(function(i){
        cols.push(i + " " + columns[i]);
    });
    var query = "CREATE TABLE "+name+" ("+cols.join(",")+")";
    this.query(query,callback);
};
