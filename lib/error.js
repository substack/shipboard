var h = require('virtual-dom/h');

module.exports = function (err, code) {
    var tree = h('div.error', err + '');
    if (code) tree.statusCode = code;
    return tree;
};
