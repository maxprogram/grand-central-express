# Grand Central Express

A modular Express framework for Node. Integrates the following libraries and features:

* __[Grand Central Junction](https://github.com/maxprogram/grand-central-junction)__ -- a simple Rails-inspired router built on top of Express.
* __[Grand Central Pipeline]()__ -- an asset pipeline designed specifically for javascript concatenation and minimization.
* __Command-line scaffold generator__ --
* Uses ejs view engine and LESS CSS compiling
* Uses Backbone.js for front-end framework
* __ORM integration__ with either [Grand Central Records](https://github.com/maxprogram/grand-central-records), JugglingDB, or Node-ORM.

## TODO

* Spin-off into seperate repo/packages
    * Grand Central Pipeline
* Make GCE ORM agnostic (able to use GCR, JugglingDB, Node-ORM)

* Use glob for getting Models
* When creating new app, don't overwrite package.json (extend it with required extras)
* Use layouts in views/EJS rendering <%= yield %>
    * render views partials within EJS
* JS Compiler:
    * Recursive requires (required files also checked)
    * Include Handlebars?

## Documentation

### Command Line

* [New Project](#NewProject)
* [Launch Server](#LaunchServer)
* [Generate Scaffold](#GenerateScaffold)
* [Generate Controller](#GenerateController)
* [Generate Model](#GenerateModel)
* [Generate Backbone Scaffold](#GenerateBackbone)
* [Generate Backbone View](#GenerateBackboneView)
* [Migrate](#Migrate)
* [Version](#Version)

### Features

* [Router](#Router)
* [Models](#Models)
* [ORM/ActiveRecord](#ORM)
* [Database Connections](#Database)
* [Client-side Compiler](#Compiler)

## Command Line

<a name="NewProject" />
### New project

__gce new APP_NAME__

Generates new app scaffolding.
```sh
# Make sure you're in the project folder already
$ mkdir project
$ cd project
$ gce new project
```

---------------------------------------
<a name="LaunchServer" />
### Launch Server

__gce server | s | start | run__

Starts Express server on port 3000. Use the __-p__ option to change ports, and the __-e__ option to change environments.
```sh
$ gce server
Grand Central Express server listening on port 3000
```

---------------------------------------
<a name="GenerateController" />
### Generate Controller

__gce generate controller NAME [action action]__

Generates a controller and associated routes with provided actions.
```sh
$ gce generate controller Company about team contact
    create  controller/company.js
```

---------------------------------------
<a name="GenerateModel" />
### Generate Model

__gce generate model NAME [field:type field:type]__

Generates a model with provided attributes.
```sh
$ gce generate model book title:string author:string
    create  models/Book.js
```

---------------------------------------
<a name="GenerateScaffold" />
### Generate Scaffold

__gce generate scaffold NAME [field:type field:type]__

Generates a model with provided attributes and a RESTful JSON controller. Also generates client-side Backbone model & collection. **The actions currently don't include __update__ or __destroy__. These are coming once the custom ORM is built.**

Pass -c to avoid creating Backbone scaffold.
```sh
$ gce generate scaffold animal name:string species:string -c
    create  models/Animal.js
    create  controllers/animal.js
    update  routes
```

---------------------------------------
<a name="GenerateBackbone" />
### Generate Backbone Scaffold

__gce [backbone | bb] [scaffold | model] NAME [field:type field:type]__

Generates Backbone model and collection for given name and fields.
```sh
$ gce bb scaffold animal name:string species:string
    create  client/models/Animal.js
    create  client/collections/animalList.js
```

---------------------------------------
<a name="GenerateBackboneView" />
### Generate Backbone View

__gce [backbone | bb] view NAME__

Generates Backbone view.
```sh
$ gce bb view item
    create  client/views/itemView.js
```

---------------------------------------
<a name="Migrate" />
### Migrate

__gce migrate__

[Not currently functional] Migrates and syncs your model schemas to the database. Use the __-e__ option to change database environments.

---------------------------------------
<a name="Version" />
### Version

__gce version | v | -v__

Gets your version of Grand Central Express.



## Features

<a name="Router" />
### Router

See [Grand Central Junction](https://github.com/maxprogram/grand-central-junction). Default routes file is `/config/routes.js`, default controllers path is `/controllers`.

---------------------------------------
<a name="Models" />
### Models

Defined in the `/models` folder, with capitalized names like `Person.js`. The model is defined like so:
```js
var Model = require('grand-central-express').Model;
module.exports = new Model({
    name: "Person",
    schema: {
        name: String,
        email: String,
        admin: Boolean,
        rank: Number
    }
});
```
Methods, validations and relationships are still in development.

---------------------------------------
<a name="ORM" />
### ORM/ActiveRecord

The default ORM is [Grand Central Records](), but can be quickly changed to [JugglingDB](https://github.com/1602/jugglingdb) or [Node-ORM](https://github.com/dresende/node-orm2) using the following steps:

1. Change your dependency `package.json` from `'grand-central-records'` to either `'jugglingdb'` or `'orm'`
2. In `app.js`, change...

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

---------------------------------------
<a name="Database" />
### Database Connections

Database connections are defined in `config/db.json`. For whatever database you use, make sure to include the package (mysql, pg, sqlite3) in your dependencies.
```json
{
    "development": {
        "adapter":  "sqlite3",
        "host":     "",
        "database": "db/development.sqlite3",
        "username": "",
        "password": ""
    }
}
```
The template defaults to using SQLite3 files for both __development__ and __production__.

---------------------------------------
<a name="Compiler" />
### Asset Pipeline & Client-Side Compiler

See [Grand Central Pipeline](https://github.com/maxprogram/grand-central-pipeline).
