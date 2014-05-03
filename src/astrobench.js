var _ = require('lodash'),
    ui = require('./ui');

var state = {
    describes: [],
    currentSuite: null
};

var Describe = function(name, fn) {
    // update global state
    state.describes.push(this);
    state.currentSuite = this;

    this.id = _.uniqueId('suite');
    this.suite = new Benchmark.Suite({
        name: name
    });

    setTimeout(function() {
        ui.drawSuite(this);
    }.bind(this));

    fn();
};

Describe.prototype = {
    setup: function(fn) {
        this.setupFn = fn;
        fn.call(this, this);
    },

    add: function(name, fn, options) {
        var suite = this;
        var bench = new Benchmark(name, function() {
            fn(suite);
        }, options);

        bench.originFn = fn;

        setTimeout(function() {
            ui.drawBench(this, bench);
            this.suite.add(bench);
        }.bind(this));
    }
};

var bench = function(name, fn, options) {
    state.currentSuite.add(name, fn, options);
};

var setup = function(fn) {
    state.currentSuite.setup(fn);
};

var run = function(index) {
    index = index || 0;

    var describe = state.describes[index];

    describe.suite
        .on('complete', function(event) {
            run(++index);
        })
        .run(_.extend({
            'async': true
        }, describe.options));
};

window.describe = function(name, fn) {
    return new Describe(name, fn);
};
window.setup = setup;
window.bench = bench;
window.run = run;
