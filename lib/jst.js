
var path = require('path'),
    hbs = require('./jst/handlebars'),
    underscore = require('./jst/underscore');

exports.handlebars = function(code, dir, name) {
    return render(hbs, code, dir, name);
};

exports.underscore = function(code, dir, name) {
    return render(underscore, code, dir, name);
};

exports._   = exports.underscore;
exports.hbs = exports.handlebars;

var options = {
    namespace: "app.jst",
    verbose: false
};

function render(engine, code, dir, name) {
    var output = 'var app = app || {};\n(function(){\n' +
        'app.jst = app.jst || {};\n';

    name = path.relative(path.join(dir,'templates'), name)
        .replace(/\\/g, '/')
        .replace(/\.ejs$|\.hbs$/, '');

    output += engine(options, name, code) + '})();';

    return output;
}
