var h = require('virtual-dom/h');
var patch = require('virtual-dom/patch');
var diff = require('virtual-dom/diff');
var create = require('virtual-dom/create-element');

var through = require('through2');
var concat = require('concat-stream');

module.exports = function (page, bus, wiki) {
    var name = page.querySelector('[key=name]');
    var desc = page.querySelector('[key=description]');
    var link = page.querySelector('[key=link]');
    return function (m) {
        name.textContent = m.params.name;
        
        wiki.heads(m.params.name).pipe(through.obj(write));
        function write (row, enc, next) {
            link.setAttribute('href', '/task/'
                + encodeURIComponent(row.hash) + '/edit'
            );
            wiki.createReadStream(row.hash).pipe(concat(function (body) {
                desc.textContent = body.toString('utf8');
            }));
        }
    };
};
