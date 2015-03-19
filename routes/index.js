var Router = require('routes');

module.exports = function (wiki, bus) {
    var router = Router();
    router.addRoute('/', require('../routes/home.js')(wiki));
    router.addRoute('/activity', require('./activity.js')(wiki));
    router.addRoute('/sync', require('./sync.js')(wiki));
    router.addRoute('/tags', require('./tag_list.js')(wiki));
    router.addRoute('/tag/:name', require('./tag_show.js')(wiki));
    router.addRoute('/tasks', require('./task_list.js')(wiki));
    router.addRoute('/tasks/new', require('./task_new.js')(wiki, bus));
    router.addRoute('/task/:name', require('./task_show.js')(wiki));
    router.addRoute('/task/:hash/edit', require('./task_edit.js')(wiki, bus));
    router.addRoute('/task/:hash/merge', require('./task_merge.js')(wiki, bus));
    return router;
};
