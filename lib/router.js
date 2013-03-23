module.exports = function(app, routes, controllerPath, models) {

    function match(route, action, options) {
        options = options || {};
        action = action.split("#");

        var controller = controllerPath + '/' + action[0],
            mod = require(controller),
            method = options.via || options.method || 'get';

        if (action.length > 1) action = action[1];
        else action = 'index';

        if (method == 'delete') method = 'del';
        middleware(method, route, mod[action]);
    }

    function resources(route, controller) {
        route = route.replace(/\/$/,'');
        if (!controller) controller = route.replace(/\//g,'');
        controller = controllerPath + '/' + controller;

        var mod = require(controller),
            routeId = route + '/:id';

        middleware('get',  route,   mod['index']);
        middleware('get',  route+'/create', mod['create']);
        middleware('get',  route+'/edit/:id', mod['update']);
        middleware('get',  route+'/delete/:id', mod['destroy']);
        middleware('get',  routeId, mod['show']);
        middleware('post', route,   mod['create']);
        middleware('put',  routeId, mod['update']);
        middleware('del',  routeId, mod['destroy']);

    }

    function middleware(method, route, action) {
        app[method](route, function(req,res,next){
            return action(req, res, models);
        });
    }

    require(routes)(match, resources);
};