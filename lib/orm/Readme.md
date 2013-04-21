
## TODO

* MySQL Pool Connections
* GCE Error Handling
* Create object for Model.new() & .save()
* Model validations
* Model relationships (hasMany, hasOne, belongsTo)
* Migration / synchronization
* query/queue/run
* MongoDB integration

## Custom ORM

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
    * .query() *(on SQL datbases)* -- executes the given query
    * .queue(query string or chain) (accepts array, string, object)
    * .run() -- executes all queries in the queue

### Inspiration

* [Node-ORM](https://github.com/dresende/node-orm2)
* [Model](https://npmjs.org/package/model)
* [Persist](https://npmjs.org/package/persist)
* [Mongoose](https://npmjs.org/package/mongoose)

# Documentation

Database connections are defined in `config/db.json`. For whatever database you use, make sure to include the package (*mysql, pg, sqlite3*) in your dependencies.

Models are accessed in controllers:
```js
exports.show = function(req, res, models) {
    var id = req.param('id');
    models.Person.find(id, function(err, person) {
        if (err) throw err;
        res.json(person);
    });
};
```
## Samples:
```js
Model.select(["name","address"]).where({admin: true}, function(err, result) {
   if (err) throw err;
   res.json(result);
});
```

## Methods:

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
