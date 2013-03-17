# Grand Central Express

A Rails-inspired Express framework for Node.

## TODO

* Scaffolding generators
    * gce generate model User
    * gce generate controller about
    * gce backbone model User
* Activerecord for DB connections
* Uglify-js
* GruntJS?

## Features

### Command Line & Scaffolding

* __gce server|s|start|run__ -- starts Express server
* __gce version|v|-v__ -- gets Grand Central version
* __gce new <name>__ -- generates new app scaffolding in current folder

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