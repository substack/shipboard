var h = require('virtual-dom/h');

module.exports = function (err, code) {
    var tree = h('div.error', [
        h('h2', 'error'),
        err + ''
    ]);
    if (code) tree.statusCode = code;
    return tree;
};
