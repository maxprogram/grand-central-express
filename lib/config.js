var fs = require('fs'),
    path = require('path');

var Config = function Config() {};

Config.prototype = {

    package: function() {
        var packagePath = path.join(__dirname, '..', 'package.json');
        return require(packagePath);
    },

    version: function() {
        return this.package().version;
    }

};

module.exports = new Config();