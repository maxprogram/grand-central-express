module.exports = function(app, routes, controllerPath) {

    function match(route, action, options) {
        options = options || {};
        action = action.split("#");

        var controller = controllerPath + '/' + action[0],
            mod = require(controller),
            method = options.via || options.method || 'get';

        if (action.length > 1) action = action[1];
        else action = 'index';

        if (method == 'delete') method = 'del';
        app[method](route, mod[action]);
    }

    function resources(route, controller) {
        route = route.replace(/\/$/,'');
        if (!controller) controller = route.replace(/\//g,'');
        controller = controllerPath + '/' + controller;

        var mod = require(controller),
            routeId = route + '/:id';

        app.get( route,   mod.index);
        app.get( routeId, mod.show);
        app.post(route,   mod.create);
        app.put( routeId, mod.update);
        app.del( routeId, mod.destroy);
        app.get( route + '/new', mod.form);
        app.get( routeId + '/edit', mod.edit);
    }

    require(routes)(match, resources);
};