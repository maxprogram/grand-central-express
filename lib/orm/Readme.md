
### TODO

* Create object for Model.new() & .save()
* MySQL Pool Connections
* GCE Error Handling
* Model validations
* Model relationships (hasMany, hasOne, belongsTo)
* Migration / synchronization
* query/queue/run
* MongoDB integration

### Custom ORM

* Connects with
    * MySQL
    * Postgres
    * SQLite3
* Chainable queries
* Other functions/aliases
    * .findByIdAndUpdate()
    * .findByIdAndRemove()
    * .create()
    * .getColumns()
* Query & queue
    * .query() *(on SQL databases)* -- executes the given query
    * .queue(query string or chain) (accepts array, string, object)
    * .run() -- executes all queries in the queue

### Inspiration

* [JugglingDB](https://github.com/1602/jugglingdb)
* [Node-ORM](https://github.com/dresende/node-orm2)
* [Model](https://npmjs.org/package/model)
* [Persist](https://npmjs.org/package/persist)
* [Mongoose](https://npmjs.org/package/mongoose)

# Documentation

## Samples:
```js
var Model = new ORM({
    adapter: "mysql",
    host: "localhost",
    database: "test",
    username: "admin",
    password: "admin"
}, "users");

Model.find(8, function(err, user){
    if (err) throw err;
    console.log(user.name);
});

Model.select(["name","address"]).where({admin: true}, function(err, result) {
    if (err) throw err;
    result.forEach(function(user) {
        ...
    });
});
```

## Query Methods:

### .all()
### .find()
### .where()
### .select()
### .order()
### .limit()
### .offset()
### .insert()
### .update()
### .remove()
