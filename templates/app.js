var express = require('express'),
    path = require('path'),
    GrandCentral = require('grand-central-express');

var app = express(),
    gce = new GrandCentral(app, __dirname);

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(require('less-middleware')({ src: __dirname + '/assets' }));
    app.use(gce.uglify());
    app.use(express.static(path.join(__dirname, 'assets')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.getModels = function(cb) { return gce.orm.getModels(cb); };
gce.route();

module.exports = app;
