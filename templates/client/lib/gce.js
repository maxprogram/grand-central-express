(function(){
    var root = this;
    var gce = root.gce = {};

    gce.log = function(msg, type) {
        type = type || 'log';
        var bold = 'font-weight: bold;',
            blue = 'color: blue;',
            yellow = 'color: yellow;',
            green = 'color: green;';

        var str = "[GCE] " + type,
            spaces = 13 - str.length;
        for (var i = 0; i < spaces; i++) str += " ";
        var head = str + ": %c";

        if (type == 'log')
            console.log('  '+head, bold+blue, msg);
        else if (type == 'success' || type == 'run')
            console.log('  '+head, bold+green, msg);
        else if (type == 'error' || type == 'err' || type == 'conflict')
            return console.error(head, bold, msg);
        else if (type == 'warn' || type == 'caution' || type == 'warning')
            return console.warn('  '+head, bold, msg);
    };

    function Error() {
        var args = arguments[0];
        var msg = args[0];
        return gce.log(msg, 'error');
    }

    gce.error = function() {
        return new Error(arguments);
    };

    var appIsHandlingError = false;

    window.onerror = function(msg, url, line) {
        if (!appIsHandlingError) {
            appIsHandlingError = true;
            handleError(msg, url, line);
        }
        return true;
    };

    function handleError(msg, url, line) {
        var arr = url.split('/'), file = '';
        for (var i = 3; i < arr.length; i++) file += '/'+arr[i];

        if (!gce.files[file]) {
            gce.error('("' + file + '" not found) '+msg);
        } else {
            var files = gce.files[file][0],
                lines = gce.files[file][1],
                count = 0, done = false;

            files.push('');
            for (i in files) {
                if (line < count && !done) {
                    line -= (count - lines[i-1] - 1);
                    file = files[i-1];
                    done = true;
                } else count += lines[i] + 5;
            }

            gce.error('('+file+':'+line+') '+msg);
        }
    }

})();
