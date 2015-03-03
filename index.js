var path = require('path');
var ecstatic = require('ecstatic');
var fs = require('fs');
var path = require('path');
var st = ecstatic(path.join(__dirname, 'public'));

var router = require('routes')();
router.addRoute('/', function () {});
router.addRoute('/tasks', function () {});
router.addRoute('/tasks/new', function () {});
router.addRoute('/task/:hash/edit', function () {});
router.addRoute('/task/:name', function () {});

module.exports = function (req, res) {
    if (router.match(req.url)) {
        html('layout.html').pipe(res);
    }
    else st(req, res);
};

function html (file) {
    return fs.createReadStream(path.join(__dirname, 'html', file));
}
