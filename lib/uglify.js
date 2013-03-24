/**
 * Adapted from Jake Wharton's uglify-js-middleware
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
    glob     = require('glob'),
    Step     = require('step'),
    jst      = require('./jst'),
    ENOENT   = 'ENOENT';


module.exports = function(options) {
    options = options || {};

    //Accept src/dest dir
    if ('string' === typeof options) options = { src: options };

    var force = options.force || false;
    var mangle = options.mangle || true;
    var compress = options.compress || true;
    var minify = options.minify || false;
    var timeLaunched = options.time || new Date();

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

            // Compile to destination path
            var compile = function compile(javascripts) {
                try {
                    if (minify) minifyJS(javascripts, uglyPath, next);
                    else combine(javascripts, uglyPath, next);
                } catch(ex) {
                    return next(ex);
                }
            };

            var javascripts, trees = [];
            Step(function(){
                fs.readFile(jsPath, 'utf8', this);
            }, function(err, str) {
                if (err) return error(err);
                var group = this.group();
                javascripts = getRequires(str);
                // Gets all files in trees
                javascripts.forEach(function(r,i) {
                    if (Array.isArray(r)) {
                        trees.push(i);
                        glob('**/*', {cwd: r[0]}, group());
                    }
                });

            }, function(err, globs) {
                // Removes any other files
                globs = globs.map(function(files) {
                    return files.filter(function(f) {
                        return (/\.js$|\.ejs$|\.hbs$/.test(f));
                    });
                });

                // Matches files back to their folders
                trees.forEach(function(t,i) {
                    var files = globs[i].map(function(f) {
                        return join(javascripts[t][0], f);
                    });
                    javascripts[t] = files;
                });

                javascripts = _.flatten(javascripts);
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
                    if (minify && compiledTime < timeLaunched) shouldCompile = true;
                    else javascripts.forEach(function(js) {
                        var mtime = fs.statSync(js).mtime;
                        if (mtime > compiledTime) shouldCompile = true;
                    });
                    if (shouldCompile) compile(javascripts);
                    else next();
                }
            });

        } else {
            next();
        }
    };

    // Concatenates requires for dev environment
    function combine(javascripts, path, cb) {
        var linesArr = [],
            nameArr = [],
            code = "";

        javascripts.forEach(function(file){
            var text = getCode(file);

            var lines = text.split(/\r\n|\r|\n/).length;
            linesArr.push(lines);
            nameArr.push(relative(src, file).replace(/\\/g,'/'));

            code +=
            "//=============================================\n" +
            "//" + file + "\n" +
            "//=============================================\n\n" +
            text + "\n\n";
        });

        // Add files & line numbers for debugging
        code += "// Line numbers for debugging\n" +
            "var gce = gce || {};\n" +
            "gce.files = gce.files || {};\n" +
            "gce.files['/" +
            relative(join(dest,'..'), path) + "'] = [" +
            JSON.stringify(nameArr) + ", " +
            JSON.stringify(linesArr) + "];";

        fs.writeFile(path, code, 'utf8', cb);
    }

    // Minifies & writes to destination
    function minifyJS(javascripts, path, cb) {
        var code = "";
        javascripts.forEach(function(file){
            code += getCode(file) + '\n';
        });
        var result = uglify.minify(code, {
            fromString: true,
            mangle: mangle,
            compress: compress
        });
        fs.writeFile(path, result.code, 'utf8', cb);
    }

    // Gets file code, renders if file is a JST
    function getCode(file, cb) {
        var code = '' + fs.readFileSync(file);
        if (/\.ejs$/.test(file)) code = jst.underscore(code, src, file);
        else if (/\.hbs$/.test(file)) code = jst.hbs(code, src, file);
        return code;
    }

    // Gets required files from source
    function getRequires(code) {
        var files = [],
            matches = code.match(/\/\/=.?require.+/g);
        matches.forEach(function(m, i) {
            var r;
            if (m.match(/require_tree|requireTree/g)) {
                r = m.replace(/\/\/=.?|require_tree|requireTree|\s/g, "");
                files.push([join(src, r)]);
            } else {
                r = m.replace(/\/\/=.?require\s|\.js|\.ejs|\.hbs|\s/g, "");
                var end;
                if (fs.existsSync(join(src, r + '.js'))) end = ".js";
                else if (fs.existsSync(join(src, r + '.ejs'))) end = ".ejs";
                else if (fs.existsSync(join(src, r + '.hbs'))) end = ".hbs";
                else error(r + "' not found!");
                files.push(join(src, r + end));
            }
        });
        return files;
    }

    // Ignore ENOENT to fall through as 404
    function error(err) {
        console.log("JS Compiler error: '" + err);
        next(ENOENT === err.code ? null : err);
    }

    return middleware;
};
