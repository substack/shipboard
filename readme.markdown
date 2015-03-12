# shipboard

build and plan software projects in tiny pieces

[View the demo.](https://6edf6275cac669e14806fccde0289c54b37a3a8c.htmlb.in)

# install

```
npm install -g shipboard
```

# usage

```
$ shipboard -p 9000
Listening on :9000
```

Then open up `http://localhost:9000`.

# status

Still early! Very incomplete. Many bugs. Wow.

# workflow

Work is broken up into tasks.
Each task can depend on other tasks as dependencies.

To create groups of tasks, add tags to individual tasks.

On tag pages, you'll see a gantt chart for the tagged tasks along with
unfinished tasks in the dependency graph.

# todo

* tag tasks with "working on" status for users (cookie lickers)
* set tasks as finished

# license

MIT
