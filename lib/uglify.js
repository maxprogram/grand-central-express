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

    var force = options.force || false,
        mangle = options.mangle || true,
        compress = options.compress || true,
        minify = options.minify || false,
        timeLaunched = options.time || new Date();

    var src = options.src;
    if (!src) throw new Error('uglify.middleware requires "src" directory');
    var dest = options.dest ? options.dest : src;

    var middleware = function middleware(req, res, next) {
        if ('GET' != req.method && 'HEAD' != req.method) return next();

        var path = url.parse(req.url).pathname;

        if (/\.js$/.test(path) && !/_skip/.test(path)) {
            var newPath = basename(path),
                destPath = join(dest, newPath),
                reqPath = join(src, newPath);
            prepare(destPath, reqPath, next);
        } else next();

    };

    // Gets list of all required javascripts,
    // then compiles if necessary.
    function prepare(destPath, reqPath, next) {
        var javascripts = [], trees = [];
        Step(function(){
            fs.readFile(reqPath, 'utf8', this);
        }, function(err, str) {
            if (err) return error(err);
            var group = this.group();
            javascripts = getRequires(str);
            // Gets all files in trees
            javascripts.forEach(function(r,i) {
                // If it's an array, it's a folder
                if (Array.isArray(r)) {
                    trees.push(i);
                    glob('**/*', {cwd: r[0]}, group());
                }
            });

        }, function(err, globs) {
            // Removes any other files
            globs = (globs) ? globs.map(function(files) {
                return files.filter(function(f) {
                    return (/\.js$|\.ejs$|\.hbs$/.test(f));
                });
            }) : null;

            // Matches files back to their folders
            trees.forEach(function(t,i) {
                var files = globs[i].map(function(f) {
                    return join(javascripts[t][0], f);
                });
                javascripts[t] = files;
            });

            javascripts = _.flatten(javascripts);
            javascripts.push(reqPath);

            if (force) compile(javascripts, destPath, next);
            else {
                var compiled = fs.existsSync(destPath);
                if (!compiled || compiled.code === ENOENT || compiled === {}) {
                // JS has not been compiled, compile it!
                    compile(javascripts, destPath, next);
                } else {
                // Compare modified times to last compile time
                    var compiledTime = fs.statSync(destPath).mtime,
                        shouldCompile = false;
                    if (minify && compiledTime < timeLaunched) shouldCompile = true;
                    else javascripts.forEach(function(js) {
                        var mtime = fs.statSync(js).mtime;
                        if (mtime > compiledTime) shouldCompile = true;
                    });
                    if (shouldCompile) compile(javascripts, destPath, next);
                    else next();
                }
            }
        });
    }

    // Compile to destination path
    function compile(javascripts, path, next) {
        try {
            if (minify) minifyJS(javascripts, path, next);
            else concatenate(javascripts, path, next);
        } catch(ex) {
            return next(ex);
        }
    }

    // Concatenates requires for dev environment
    function concatenate(javascripts, path, cb) {
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
            relative(join(dest,'..'), path).replace(/\\/g, '/') +
            "'] = [" +
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
    function getCode(file) {
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
                r = m.replace(/\/\/=.?require\s|\.js$|\.ejs$|\.hbs$|\s/g, "");
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
