
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
    var subs = subTemplate(code),
        output = 'var app = app || {};\n(function(){\n' +
            'app.jst = app.jst || {};\n';

    name = path.relative(path.join(dir,'templates'), name)
        .replace(/\\/g, '/')
        .replace(/\.ejs$|\.hbs$/, '');

    if (subs) output += subTemplateString(name, subs, engine);
    else output += engine(options, name, code);

    return output + '})();';
}

function subTemplate(file_contents){
    var find_subs = /\/\*\s?(\w+)\s?\*\//,
        subs = file_contents.trim().split(find_subs);

    return subs.length > 1 && subs.length % 2 ? subs : false;
}

// Builds multi part template string from subtemplates
function subTemplateString(name, subs, engine){
    var l = subs.length,
        code = "";

    for(var i = 0; i < l; i += 2){
        name = subs[ i - 1 ] !== null ? nm +'_'+ subs[ i - 1] : nm;
        code += engine(options, name, subs[i]);
    }
    return code;
}
