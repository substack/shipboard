var adiff = require('adiff');
var concat = require('concat-stream');
var split = '';

module.exports = function (wiki, hashes, cb) {
    wiki.concestor(hashes, function (err, cons) {
        if (err) return cb(err);
        
        if (cons.length === 0) return cb(new Error('todo: no concestor'));
        if (cons.length !== 1) return cb(new Error('todo: >1 concestor'));
        
        load([cons[0]].concat(hashes), function (err, metas, bodies) {
            var c = bodies[0];
            cb(null, metas[0], bodies.slice(1).reduce(function (a, b) {
                var p = adiff.diff3(
                    a.split(split),
                    c.split(split),
                    b.split(split)
                );
                return adiff.patch(c.split('\n'), p);
            }));
        });
    });
    
    function load (hashes, cb_) {
        function cb () {
            if (cb_) cb_.apply(this, arguments);
            cb_ = null;
        }
        var pending = hashes.length * 2;
        var bodies = [];
        var metas = [];
        hashes.forEach(function (hash, ix) {
            wiki.get(hash, function (err, meta) {
                if (err) return cb(err);
                metas[ix] = meta
                if (-- pending === 0) cb(null, metas, bodies);
            });
            
            var r = wiki.createReadStream(hash);
            r.on('error', cb);
            r.pipe(concat(onbody));
            function onbody (body) {
                bodies[ix] = body.toString('utf8');
                if (-- pending === 0) cb(null, metas, bodies);
            }
        });
        if (pending === 0) cb(null, [], []);
    }
};
