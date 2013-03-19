# Grand Central Express

A Rails-inspired Express framework for Node. Integrates with ejs view engine, LESS CSS compiling, and Backbone.js.

## TODO

* Scaffolding generators
    * gce generate model
    * gce generate scaffold
    * gce backbone model
* Activerecord for DB connections

## Documentation

### Command Line

* [NewProject](New Project)
* [LaunchServer](Launch Server)
* Generate Scaffold
* [GenerateController](Generate Controller)
* [GenerateModel](Generate Model)
* [Version](Version)

### Features

* [Router](Router)
* [Compiler](Client-side Compiler)

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

__gce server|s|start|run__

Starts Express server on port 3000. Use the -p option to change ports, and the -e option to change environments.
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
<a name="Version" />
### Version

__gce version|v|-v__

Gets your version of Grand Central Express.



## Features

<a name="Router" />
### Router

__#route(routes_path, controllers_path)__

* *routes_path* defaults to `'config/routes'`
* *controllers_path* defaults to `'controllers'`

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
    match('/',            'home#index');
    match('/users',       'user#list', {via: 'post'});
    resources('/project', 'project');
};
```
Routes:
```
GET    /             => /controllers/home.js#index
POST   /users        => /controllers/user.js#list
GET    /project      => /controllers/project.js#index
GET    /project/:id  => /controllers/project.js#show
POST   /project      => /controllers/project.js#create
PUT    /project/:id  => /controllers/project.js#update
DELETE /project/:id  => /controllers/project.js#destroy
GET    /project/new  => /controllers/project.js#form
GET    /project/edit => /controllers/project.js#edit
```

---------------------------------------
<a name="Compiler" />
### Client-Side Compiler

All client-side javascript goes in the __/client__ directory. When a file is requested, it is compiled using UglifyJS into the public __/javascripts__ directory. Other javascipt files can be required using `//= require` or `//= require_tree`, which will be compiled into the requested file.

__/client/test.js__:
```js
//= require lib/jquery

$(function(){ document.write("Hello World") });
```
This would output to __javascripts/test.js__, and be linked to in views as:
```html
<script type="text/javascript" src="javascripts/test.js"></script>
```
