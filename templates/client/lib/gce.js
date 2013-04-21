(function(){
    var root = this;
    var gce = root.gce = {};
    var handleErrors = true;

    gce.log = function(msg, type) {
        type = type || 'log';

        var str = "[GCE] " + type,
            spaces = 14 - str.length;
        for (var i = 0; i < spaces; i++) str += " ";
        var head = str + ": ";

        if (type == 'log')
            log(head+'_'+msg+'_');
        else if (type == 'success' || type == 'run')
            log(head+'[c="color: green; font-weight: bold"]'+msg+'[c]');
        else if (type == 'error' || type == 'err' || type == 'conflict')
            log(head+'[c="color: red; font-weight: bold"]'+msg+'[c]');
        else if (type == 'warn' || type == 'caution' || type == 'warning')
            log(head+'[c="color: #f88e00; font-weight: bold"]'+msg+'[c]');
    };

    gce.success = function(msg) {
        gce.log(msg, 'success');
    };

    function Error() {
        var args = arguments[0];
        var msg = args[0];
        gce.log(msg, 'error');
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
        return handleErrors;
    };

    function handleError(msg, url, line) {
        var arr = url.split('/'), file = '';
        for (var i = 3; i < arr.length; i++) file += '/'+arr[i];

        if (!gce.files[file]) {
            gce.error('{ "' + file + '" not found } '+msg);
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

            gce.error('{ '+file+':'+line+' } '+msg);
        }
    }

})();

// From adamschwartz / log

(function() {
  var formats, getOrderedMatches, hasMatches, isIE, isSafari, log, makeArray, stringToArgs, _log;
  if (!(window.console && window.console.log)) {
    return;
  }
  log = function() {
    var args;
    args = [];
    makeArray(arguments).forEach(function(arg) {
      if (typeof arg === 'string') {
        return args = args.concat(stringToArgs(arg));
      } else {
        return args.push(arg);
      }
    });
    return _log.apply(window, args);
  };
  _log = function() {
    return console.log.apply(console, makeArray(arguments));
  };
  makeArray = function(arrayLikeThing) {
    return Array.prototype.slice.call(arrayLikeThing);
  };
  formats = [
    {
      regex: /\*([^\*)]+)\*/,
      replacer: function(m, p1) {
        return "%c" + p1 + "%c";
      },
      styles: function() {
        return ['font-style: italic', ''];
      }
    }, {
      regex: /\_([^\_)]+)\_/,
      replacer: function(m, p1) {
        return "%c" + p1 + "%c";
      },
      styles: function() {
        return ['font-weight: bold', ''];
      }
    }, {
      regex: /\`([^\`)]+)\`/,
      replacer: function(m, p1) {
        return "%c" + p1 + "%c";
      },
      styles: function() {
        return ['background: rgb(255, 255, 219); padding: 1px 5px; border: 1px solid rgba(0, 0, 0, 0.1)', ''];
      }
    }, {
      regex: /\[c\=\"([^\")]+)\"\]([^\[)]+)\[c\]/,
      replacer: function(m, p1, p2) {
        return "%c" + p2 + "%c";
      },
      styles: function(match) {
        return [match[1], ''];
      }
    }
  ];
  hasMatches = function(str) {
    var _hasMatches;
    _hasMatches = false;
    formats.forEach(function(format) {
      if (format.regex.test(str)) {
        return _hasMatches = true;
      }
    });
    return _hasMatches;
  };
  getOrderedMatches = function(str) {
    var matches;
    matches = [];
    formats.forEach(function(format) {
      var match;
      match = str.match(format.regex);
      if (match) {
        return matches.push({
          format: format,
          match: match
        });
      }
    });
    return matches.sort(function(a, b) {
      return a.match.index - b.match.index;
    });
  };
  stringToArgs = function(str, args) {
    var firstMatch, matches, styles;
    styles = [];
    while (hasMatches(str)) {
      matches = getOrderedMatches(str);
      firstMatch = matches[0];
      str = str.replace(firstMatch.format.regex, firstMatch.format.replacer);
      styles = styles.concat(firstMatch.format.styles(firstMatch.match));
    }
    return [str].concat(styles);
  };
  isSafari = function() {
    return /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
  };
  isIE = function() {
    return /MSIE/.test(navigator.userAgent);
  };
  if (isSafari() || isIE()) {
    window.log = _log;
  } else {
    window.log = log;
  }
  window.log.l = _log;
}).call(this);
