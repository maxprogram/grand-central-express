# Grand Central Express

A Rails-inspired Express framework for Node.

## TODO

* Scaffolding generators
    * gce generate model User
    * gce generate controller about
    * gce backbone model User
* Activerecord for DB connections

## Generators

### New project

__gce new <name>__
Generates new app scaffolding.
```sh
# Make sure you're in the project folder already
mkdir project
cd project
gce new project
```

__gce server | s | start | run__
Starts Express server on port 3000. Use the -p argument to change ports.
```sh
gce server
```
### Version

__gce version|v|-v__
Gets your version of Grand Central Express.


## Features

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

### Client-Side Compiler

All client-side javascript goes in the /client directory. When a file is requested, it is compiled using UglifyJS into the public /javascripts directory. Other javascipt files can be required using `//= require`, which will be compiled into the requested file.

__/client/test.js__:
```js
//= require lib/jquery

$(function(){ document.write("Hello World") });
```

__/views/index.ejs__:
```html
<script type="text/javascript" src="javascripts/test.js"></script>

<!-- => Hello World -->
```