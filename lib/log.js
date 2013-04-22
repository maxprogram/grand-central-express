var _ = require('underscore');

var bold  = '\033[1m',
    blue  = '\033[34m',
    green = '\033[32m',
    cyan  = '\033[36m',
    red   = '\033[31m',
    mag   = '\033[35m',
    yell  = '\033[33m',
    reset = '\033[0m';

exports.log = function(str) {
    var msg = bold + blue + '[GCE] ' + reset;
    msg += str;

    console.log(msg);
};

exports.error = function(str, kill) {
    kill = kill || true;
    var msg = bold + red + 'ERROR' + reset;
    msg += ' ' + str;

    exports.log(msg);
    if (kill) process.exit(1);
};

exports.warn = function(str) {
    var msg = bold + yell + 'WARNING' + reset;
    msg += ' ' + str;

    exports.log(msg);
};

exports.generator = function(task, file) {
    function cols(txt) {
        var str = "", spaces = 12 - txt.length;
        for (var i = 0; i < spaces; i++) str += " ";
        return str += txt + "  ";
    }

    if (_.contains(['create','run','migrate'], task))
        console.log(bold + green + cols(task) + reset + file);
    else if (_.contains(['exist','identical','update'], task))
        console.log(bold + blue + cols(task) + reset + file);
    else if (_.contains(['conflict','error'], task))
        console.log(bold + red + cols(task) + reset + file);
    else if (_.contains(['done'], task))
        console.log(bold + cols(task) + reset + file);
};

exports.database = function(str, type, time) {

    type = type || '';

    function cols(txt) {
        var str = " ", spaces = 23 - txt.length;
        for (var i = 0; i < spaces; i++) str += " ";
        return txt + str;
    }

    var task = (type==='') ? '' : type + " (" + time + "ms)";
    console.log(bold + cyan + cols(task) + reset + str);

};
