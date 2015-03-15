module.exports = function (stream, show, fn) {
    stream.once('error', function (err) { show(fn(err)) });
    return stream;
};
