var path = require('path');
var ecstatic = require('ecstatic');
var hyperstream = require('hyperstream');
var fs = require('fs');
var path = require('path');
var has = require('has');
var st = ecstatic(path.join(__dirname, 'public'));

var pages = {
    '/': 'index.html',
    '/task/create': 'create_task.html'
};

module.exports = function (req, res) {
    if (has(pages, req.url)) {
        html('layout.html').pipe(hyperstream({
            '#content': html(pages[req.url])
        })).pipe(res);
    }
    else st(req, res);
};

function html (file) {
    return fs.createReadStream(path.join(__dirname, 'html', file));
}
