
module.exports = function(str, type, time) {

    type = type || '';

    var bold  = '\033[1m',
        blue  = '\033[34m',
        green = '\033[32m',
        cyan  = '\033[36m',
        red   = '\033[31m',
        mag   = '\033[35m',
        reset = '\033[0m';

    function cols(txt) {
        var str = " ", spaces = 23 - txt.length;
        for (var i = 0; i < spaces; i++) str += " ";
        return txt + str;
    }

    var task = (type==='') ? '' : type + " (" + time + "ms)";
    console.log(bold + cyan + cols(task) + reset + str);

};
