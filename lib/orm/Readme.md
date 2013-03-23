## Custom ORM

*  Connects with
    * MySQL
    * Postgres
    * SQLite3
    * MongoDB
* Chainable queries
    * .all()
    * .find()
    * .select()
    * .where()
    * .order()
    * .limit()
    * .offset()
    * .returning()
    * .insert()
    * .update()
    * .destroy()
* Other functions
    * .findByIdAndUpdate()
    * .findByIdAndRemove()
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


