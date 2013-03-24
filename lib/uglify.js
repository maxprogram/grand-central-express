/**
 * Adapted from Jake Wharton / uglify-js-middleware
 */

var _        = require('underscore'),
    uglify   = require('uglify-js'),
    fs       = require('fs'),
    url      = require('url'),
    npath    = require('path'),
    basename = npath.basename,
    dirname  = npath.dirname,
    join     = npath.join,
    relative = npath.relative,
    async    = require('async'),
    Step     = require('step'),
    ENOENT   = 'ENOENT';


module.exports = function(options) {
    options = options || {};

    //Accept src/dest dir
    if ('string' === typeof options) options = { src: options };

    var force = options.force || false;
    var mangle = options.mangle || true;
    var compress = options.compress || true;
    var minify = options.minify || false;

    var src = options.src;
    if (!src) throw new Error('uglify.middleware requires "src" directory');
    var dest = options.dest ? options.dest : src;

    var uglyext = options.uglyext || (src === dest);
    var uglyregex = uglyext ? /\.ugly\.js$/ : /\.js$/;

    var middleware = function middleware(req, res, next) {
        if ('GET' != req.method && 'HEAD' != req.method) return next();

        var path = url.parse(req.url).pathname;
        if (uglyregex.test(path)) {

            var newPath = basename(path),
                uglyPath = join(dest, newPath),
                jsPath = join(src, uglyext ? newPath.replace('.ugly.js', '.js') : newPath);

            // Ignore ENOENT to fall through as 404
            var error = function error(err) {
                next(ENOENT === err.code ? null : err);
            };

            // Compile to destination path
            var compile = function compile(javascripts) {
                try {
                    // Minifies & writes to destination
                    var code = {code: ""};
                    if (minify) {
                        code = uglify.minify(javascripts, {
                            mangle: mangle,
                            compress: compress
                        });
                    } else {
                    // Concatenates requires for dev environment
                        var linesArr = [], nameArr = [];
                        javascripts.forEach(function(js){
                            var text = fs.readFileSync(js) + "";
                            var lines = text.split(/\r\n|\r|\n/).length;
                            linesArr.push(lines);
                            nameArr.push(relative(src, js).replace(/\\/g,'/'));

                            code.code +=
                            "//=============================================\n" +
                            "//" + js + "\n" +
                            "//=============================================\n\n" +
                            text + "\n\n";
                        });

                        // Add files & line numbers for debugging
                        code.code += "// Line numbers for debugging\n" +
                            "var gce = gce || {};\n" +
                            "gce['/" +
                            relative(join(dest,'..'), uglyPath) + "'] = [" +
                            JSON.stringify(nameArr) + ", " +
                            JSON.stringify(linesArr) + "];";
                    }
                    fs.writeFile(uglyPath, code.code, 'utf8', next);
                } catch(ex) {
                    return next(ex);
                }
            };

            var original, javascripts;
            Step(function(){
                fs.readFile(jsPath, 'utf8', this);
            }, function(err, str) {
                if (err) return error(err);
                javascripts = getRequires(str);

                // Finds any non-existing files
                async.reject(javascripts, fs.exists, this);

            }, function(notFound) {
                if (notFound[0]) notFound.forEach(function(n){
                    console.log(n + " not found!");
                });

                // Gets array of matching files
                javascripts = _.difference(javascripts, notFound);
                javascripts.push(jsPath);

                if (force) compile(javascripts);
                else fs.exists(uglyPath, this);

            }, function(compiled) {
                if (!compiled) {
                // JS has not been compiled, compile it!
                    compile(javascripts);
                } else {
                // Compare modified times to last compile time
                    var compiledTime = fs.statSync(uglyPath).mtime,
                        shouldCompile = false;
                    javascripts.forEach(function(js) {
                        if (fs.statSync(js).mtime > compiledTime)
                            shouldCompile = true;
                    });
                    if (shouldCompile) compile(javascripts);
                    else next();
                }
            });

        } else {
            next();
        }
    };

    // Gets required files from source
    function getRequires(code) {
        var requires = [];
        var matches = code.match(/\/\/=.?require.+/g);
        matches.forEach(function(m, i) {
            var r;
            if (m.match(/require_tree|requireTree/g)) {
                r = m.replace(/\/\/=.?|require_tree|requireTree|\s/g, "");
                var files = fs.readdirSync(join(src, r));
                files.forEach(function(f){
                    requires.push(join(src, r, f));
                });
            } else {
                r = m.replace(/\/\/=.?require\s|\.js|\s/g, "");
                requires.push(join(src, r + ".js"));
            }
        });
        return requires;
    }

    return middleware;
};
