var fs = require('fs'),
    path = require('path');

var Config = function Config() {};

Config.prototype = {

    package: function() {
        var packagePath = path.join(__dirname, '..', 'package.json');
        var packagesJSON = JSON.parse(fs.readFileSync(packagePath));
        return packagesJSON;
    },

    version: function() {
        return this.package().version;
    }

};

module.exports = new Config();