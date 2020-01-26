var $ = require('jbone');
var Benchmark = require('benchmark');

var astrobench = require('./astrobench');
var dictionary = require('./translations');
var util = require('./util');

var tmplApp = require('./templates/app.html');
var tmplSuite = require('./templates/suite.html');
var tmplBench = require('./templates/bench.html');

$('#astrobench').html(tmplApp({
    dictionary: dictionary
}));

var $runButton = $('.fn-run-tests');

$runButton.on('click', function(e) {
    e.preventDefault();

    astrobench.abort();

    $runButton.html(dictionary.stopAll);

    if (!astrobench.state.running) {
        astrobench.run({
            onStop: function() {
                $runButton.html(dictionary.runAll);
            }
        });
    }
});

var onBenchComplete = function(event, suite) {
    var me = event.target,
        error = me.error,
        hz = me.hz,
        stats = me.stats,
        id = me.id,
        result = '',
        $bench = $('#bench-' + id),
        $results = $bench.find('.fn-bench-result'),
        ops,
        mean,
        rme;

    $bench.find('.fn-run-bench').html(dictionary.runBenchmark);

    if (error) {
        result += error.toString();
        $bench.addClass('warning');
        $results.addClass('error');
    } else {
        if (me.aborted) {
            return $bench.find('.fn-bench-state').html('aborted');
        }

        ops = Benchmark.formatNumber(hz.toFixed(hz < 100 ? 2 : 0));
        result += ' x ' + ops + ' ops/sec ';
        if (hz < 500) {
            mean = (stats.mean * 1000).toFixed(1);
            result += mean + 'ms ';
        }
        rme = stats.rme.toFixed(2);
        result += '±' + rme + '%';
        me.sum = { ops: ops, mean: mean, rme:rme }
    }

    if (suite && suite.suite.running === false) {
        onSuiteComplete.call(suite.suite, event, suite);
    }

    $results.html(result);
};

var onSuiteComplete = function(event, suite) {
    suite.$el.find('.fn-run-suite').html(dictionary.runSuite);

    if (event.target.aborted) return;

    var fastest = this.filter('fastest'),
        delta,
        hz,
        $bench;

    this.forEach(function(bench) {
        if (bench.stats.rme === 0) return;

        $bench = $('#bench-' + bench.id);

        if (fastest.indexOf(bench) !== -1) {
            bench.sum.fastest = true;
            $bench[0].classList.add('fastest');
            $bench.find('.fn-bench-status').html('(fastest)');
            return;
        }

        if (fastest.length > 1) {
            hz = fastest.reduce(function(memo, bench) {
                return memo + bench.hz;
            }, 0) / fastest.length;
        } else {
            hz = fastest[0].hz;
        }

        delta = (Math.abs(bench.hz - hz) / hz * 100).toFixed(2);
        bench.sum.delta = delta;
        $bench.removeClass('fastest');
        $bench.find('.fn-bench-status').html('(' + delta + '% slower)');
        $bench.find('.bench-background').css('width', ((bench.hz / hz) * 100) + '%');
    });
};

exports.drawSuite = function(suite) {
    suite.$el = $(tmplSuite({
        fnstrip: util.fnstrip,
        hilite: util.hilite,
        suite: suite,
        dictionary: dictionary
    }));

    $('.fn-suites').append(suite.$el);

    // dom event binding
    suite.$el
        .on('click', '.fn-run-suite', function(e) {
            e.preventDefault();
            suite.run();
        })
        .on('click', '.fn-show-setup', function(e) {
            if (e.defaultPrevented) return;
            $('.suite-setup', suite.$el)[0].classList.toggle('hidden');
        });

    // suite event binding
    suite.suite
        .on('start', function() {
            suite.$el.find('.fn-run-suite').html(dictionary.stopSuite);
        })
        .on('complete', function(event) {
            onSuiteComplete.call(suite.suite, event, suite);
        })
        .on('cycle', onBenchComplete);
};

exports.drawBench = function(suite, bench) {
    var $bench = $(tmplBench({
            bench: bench,
            fnstrip: util.fnstrip,
            hilite: util.hilite,
            dictionary: dictionary
        })),
        // cache state Node for fast writing
        $state = $bench.find('.fn-bench-state');

    var onComplete = function(event) {
        onBenchComplete(event, suite);
    };

    suite.$el.find('.fn-benchs').append($bench);

    // dom event binding
    $bench
        .on('click', '.fn-run-bench', function(e) {
            e.preventDefault();
            suite.runBenchmark(bench.id);
        })
        .on('click', '.fn-show-source', function(e) {
            if (e.defaultPrevented) return;
            $bench.toggleClass('opened');
        });

    // benchmark event binding
    bench
        .on('start', function(event) {
            $bench.removeClass('fastest');
            $bench.removeClass('warning');
            $bench.find('.fn-bench-status, .fn-bench-result').html('');
            $bench.find('.fn-run-bench').html(dictionary.stopBenchmark);

            event.target.off('complete', onComplete);
            event.target.on('complete', onComplete);
        })
        .on('cycle', function(event) {
            $state.html(Benchmark.formatNumber(event.target.count) + ' (' + event.target.stats.sample.length + ' samples)');
        });
};
