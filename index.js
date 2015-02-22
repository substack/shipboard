var path = require('path');
var ecstatic = require('ecstatic');
var st = ecstatic(path.join(__dirname, 'public'));

module.exports = function (req, res) {
    st(req, res);
};
