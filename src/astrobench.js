var _ = require('lodash');
var Benchmark = require('benchmark');

var ui = require('./ui');

window.Benchmark = Benchmark;

var globalOptions = {};

var state = {
    describes: [],
    currentSuite: null,
    running: false,
    aborted: false,
    index: 0
};

var deprecate = function(oldName, newName) {
    console.log('The function "' + oldName + '" is deprecated. Use "' +
        newName + '" instead.');
}

var Listeners = function() {
    this.callbacks = [];
    this.runner = this.run.bind(this);
};

Listeners.prototype.add = function(callback) {
    this.callbacks.push(callback);
}

Listeners.prototype.run = function() {
    this.callbacks.forEach(function (callback) {
        callback();
    });
}

var Suite = function(name, fn) {
    // update global state
    state.describes.push(this);
    state.currentSuite = this;

    this.id = _.uniqueId('suite');
    this.sandbox = {};
    this.suite = new Benchmark.Suite(name);
    this.beforeBenchListeners = new Listeners();
    this.afterBenchListeners = new Listeners();

    setTimeout(ui.drawSuite.bind(this, this));

    fn(this.sandbox);
};

Suite.prototype = {
    setup: function(fn) {
        deprecate('setup', 'beforeBench');
        this.setupFn = fn;
    },

    after: function(fn) {
        deprecate('after', 'afterBench');
        this.afterFn = fn;
    },

    beforeBench: function(fn) {
        this.beforeBenchListeners.add(fn);
    },

    afterBench: function(fn) {
        this.afterBenchListeners.add(fn);
    },

    add: function(name, fn, options) {
        if (this.setupFn || this.afterFn || !_.isEmpty(globalOptions)) {
            options = _.extend({}, options, globalOptions, {
                onStart: this.setupFn,
                onComplete: this.afterFn
            });
        }

        var bench = _.last(this.suite.add(name, fn, options));

        bench.originFn = fn;
        bench.originOption = options;
        bench.on('start', this.beforeBenchListeners.runner);
        bench.on('complete', this.afterBenchListeners.runner);

        setTimeout(ui.drawBench.bind(this, this, bench));
    },

    run: function() {
        var stopped = !this.suite.running;
        this.suite.abort();

        if (stopped) {
            this.suite.aborted = false;
            this.suite.run({ async: true });
        }
    },

    runBenchmark: function(id) {
        this.suite.filter(function(bench) {
            if (bench.id !== id) return;

            var stopped = !bench.running;
            bench.abort();

            if (stopped) {
                bench.run({ async: true });
            }
        });
    }
};

var bench = function(name, fn, options) {
    state.currentSuite.add(name, fn, options);
};

var setup = function(fn) {
    state.currentSuite.setup(fn);
};

var after = function(fn) {
    state.currentSuite.after(fn);
};

var beforeBench = function(fn) {
    state.currentSuite.beforeBench(fn);
};

var afterBench = function(fn) {
    state.currentSuite.afterBench(fn);
};

var run = function(options) {
    var suite = state.describes[state.index],
        onComplete = function() {
            state.index++;
            suite.suite.off('complete', onComplete);
            run(options);
        };

    if (suite && !state.aborted) {
        state.running = true;
        suite.run();
        suite.suite.on('complete', onComplete);
    } else {
        state.index = 0;
        state.running = false;
        state.aborted = false;
        if (options && options.onStop) {
            options.onStop();
        }
    }
};

run.options = function(options) {
    _.assign(globalOptions, options);
};

var abort = function() {
    state.describes[state.index].suite.abort();

    if (state.running === true) {
        state.aborted = true;
    }
};

exports.state = state;
exports.run = run;
exports.abort = abort;

window.suite = function(name, fn) {
    return new Suite(name, fn);
};
window.setup = setup;
window.beforeBench = beforeBench;
window.bench = bench;
window.after = after;
window.afterBench = afterBench;

window.astrobench = run;
