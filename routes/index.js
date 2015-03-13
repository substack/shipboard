var Router = require('routes');

module.exports = function (wiki, bus) {
    var router = Router();
    router.addRoute('/', require('../routes/home.js')(wiki));
    router.addRoute('/activity', require('../routes/activity.js')(wiki));
    router.addRoute('/tags', require('../routes/tag_list.js')(wiki));
    router.addRoute('/tag/:name', require('../routes/tag_show.js')(wiki));
    router.addRoute('/tasks', require('../routes/task_list.js')(wiki));
    router.addRoute('/tasks/new', require('../routes/task_new.js')(wiki, bus));
    router.addRoute('/task/:name', require('../routes/task_show.js')(wiki));
    router.addRoute('/task/:hash/edit',
        require('../routes/task_edit.js')(wiki, bus)
    );
    return router;
};
