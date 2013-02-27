# Grand Central Express

A Rails-inspired Express framework for Node.

## Features

### Router

__#route(routes_path, controllers_path)__

* *routes_path* defaults to `'config/routes'`
* *controllers_path* defaults to `'controllers'`

```js
var express = require('express'),
    GrandCentral = require('grand-central-express'),
    app = express(),
    gc = new GrandCentral(app, __dirname);

gc.route();
```
