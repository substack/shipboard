var path = require('path');
var ecstatic = require('ecstatic');
var fs = require('fs');
var path = require('path');
var has = require('has');
var st = ecstatic(path.join(__dirname, 'public'));

var router = require('routes')();
router.addRoute('/', function () {});
router.addRoute('/tasks', function () {});
router.addRoute('/projects', function () {});
router.addRoute('/projects/new', function () {});
router.addRoute('/project/:name', function () {});
router.addRoute('/view', function () {});
router.addRoute('/edit', function () {});

module.exports = function (req, res) {
    if (router.match(req.url)) {
        html('layout.html').pipe(res);
    }
    else st(req, res);
};

function html (file) {
    return fs.createReadStream(path.join(__dirname, 'html', file));
}
