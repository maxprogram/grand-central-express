# Grand Central Express

A Rails-inspired Express framework for Node. Integrates with ejs view engine, LESS CSS compiling, and Backbone.js. This is a work in progress. Everything featured in the docs below should be functional.

## TODO

* Backbone.js generators
    * gce backbone collection (with scaffold?)
    * gce backbone view
* Create custom ORM (in working __orm__ branch)

## Documentation

### Command Line

* [New Project](#NewProject)
* [Launch Server](#LaunchServer)
* [Generate Scaffold](#GenerateScaffold)
* [Generate Controller](#GenerateController)
* [Generate Model](#GenerateModel)
* [Migrate](#Migrate)
* [Version](#Version)

### Features

* [Router](#Router)
* [Models](#Models)
* [ORM/ActiveRecord](#ORM)
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
```

---------------------------------------
<a name="GenerateModel" />
### Generate Model

__gce generate model NAME [field:type field:type]__

Generates a model with provided attributes.
```sh
$ gce generate model book title:string author:string
```

---------------------------------------
<a name="GenerateScaffold" />
### Generate Scaffold

__gce generate scaffold NAME [field:type field:type]__

Generates a model with provided attributes and a RESTful JSON controller. (**The actions currently don't include __update__ or __destroy__. These are coming once the custom ORM is built.**)
```sh
$ gce generate scaffold animal name:string species:string
```

---------------------------------------
<a name="Migrate" />
### Migrate

__gce migrate__

Migrates and syncs your model schemas to the database. Use the __-e__ option to change database environments.

---------------------------------------
<a name="Version" />
### Version

__gce version | v | -v__

Gets your version of Grand Central Express.



## Features

<a name="Router" />
### Router

__#route(options)__

* *options.routes* is the routes path (defaults to `'config/routes'`)
* *options.controllers* is the controllers path (defaults to `'controllers'`)
* *options.orm* toggles use of ORM in controllers

```js
var express = require('express'),
    GrandCentral = require('grand-central-express'),
    app = express(),
    gce = new GrandCentral(app, __dirname);

gce.route();
```

In __/config/routes.js__:
```js
module.exports = function(match, resources) {
    match('/',      'home#index');
    match('/users', 'user#list', {via: 'post'});
    resources('/animal', 'animal');
};
```
Routes:
```
GET    /            => /controllers/home.js#index
POST   /users       => /controllers/user.js#list
GET    /animal      => /controllers/animal.js#index
GET    /animal/:id  => /controllers/animal.js#show
POST   /animal      => /controllers/animal.js#create
PUT    /animal/:id  => /controllers/animal.js#update
DELETE /animal/:id  => /controllers/animal.js#destroy
GET    /animal/create     => /controllers/animal.js#create
GET    /animal/edit/:id   => /controllers/animal.js#update
GET    /animal/delete/:id => /controllers/animal.js#destroy
```

---------------------------------------
<a name="Models" />
### Models

Defined in the `/models` folder, with capitalized names like `Person.js`. The model is defined like so:
```js
module.exports = function(val) {
    return {
        name: "Person",
        schema: {
            name: String,
            email: String,
            admin: Boolean,
            rank: Number
        },
        methods: {
            isAdmin: function() {
                return this.admin;
            }
        },
        validations: {
            email: val.patterns.email('Invalid email')
        }
    };
};
```
`val` contains ORM's [common validators](https://github.com/dresende/node-orm2/blob/master/lib/Validators.js). Or you can write your own.

---------------------------------------
<a name="ORM" />
### ORM/ActiveRecord

Currently uses [node-orm2 by dresende](http://dresende.github.com/node-orm2/). Go there for more detailed documentation.

Turned on by default, but can be turned off by passing `{orm: true}` to the GCE router.

Models are accessed in controllers:
```js
exports.show = function(req, res, models) {
    var id = req.param('id');
    models.Person.findById(id, function(err, person) {
        if (err) throw err;
        res.json(person);
    });
};
```

---------------------------------------
<a name="Compiler" />
### Client-Side Compiler

All client-side javascript goes in the __/client__ directory. When a file is requested, it is compiled into a single JS file in the public __/javascripts__ directory. Other javascipt files can be required using `//= require` or `//= require_tree`, which will be compiled into the requested file.

In the *development* environment, required JS files are concatenated and labeled as is. The GCE client-side library handles errors to return the correct file names and line numbers for debugging.

In *production*, they are minified using UglifyJS.

__/client/test.js__:
```js
//= require lib/jquery
//= require_tree ./ui

$(function(){ document.write("Hello World") });
```
This would output to __javascripts/test.js__, and will include the required files/directories in the order they are listed. It can be linked to in views as:
```html
<script type="text/javascript" src="javascripts/test.js"></script>
```
