var $ = require('jbone'),
    _ = require('lodash'),
    astrobench = require('./astrobench')
    tmplApp = require('./templates/app.html'),
    tmplSuite = require('./templates/suite.html'),
    tmplBench = require('./templates/bench.html');

var dictionary = {
    runSuite: 'Run suite',
    stopSuite: 'Stop suite',
    runBenchmark: 'Run benchmark',
    stopBenchmark: 'Stop benchmark',
    runAll: 'Run all tests',
    stopAll: 'Stop all tests'
};

$('#astrobench').html(tmplApp({
    dictionary: dictionary
}));

$('.fn-run-tests').on('click', function(e) {
    e.preventDefault();
    astrobench.abort();

    $('.fn-run-tests').html(dictionary.stopAll);

    if (!astrobench.state.running) {
        astrobench.run({
            onStop: function() {
                $('.fn-run-tests').html(dictionary.runAll);
            }
        });
    }
});

var hilite = function(str) {
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\/\/(.*)/gm, '<span class="comment">//$1</span>')
        .replace(/('.*?')/gm, '<span class="string">$1</span>')
        .replace(/(\d+\.\d+)/gm, '<span class="number">$1</span>')
        .replace(/(\d+)/gm, '<span class="number">$1</span>')
        .replace(/\bnew *(\w+)/gm, '<span class="keyword">new</span> <span class="init">$1</span>')
        .replace(/\b(function|new|throw|return|var|if|else)\b/gm, '<span class="keyword">$1</span>');
};

var fnstrip = function(fn) {
    str = fn.toString()
        .replace(/\r\n?|[\n\u2028\u2029]/g, "\n").replace(/^\uFEFF/, '')
        .replace(/^function *\(.*\) *{/, '')
        .replace(/\s+\}$/, '');

    var spaces = str.match(/^\n?( *)/)[1].length,
        tabs = str.match(/^\n?(\t*)/)[1].length,
        re = new RegExp('^\n?' + (tabs ? '\t' : ' ') + '{' + (tabs ? tabs : spaces) + '}', 'gm');

    str = str.replace(re, '');

    return str.trim();
};

var onBenchComplete = function(event) {
    var me = event.target,
        error = me.error,
        hz = me.hz,
        id = me.id,
        stats = me.stats,
        pm = Benchmark.support.java ? '+/-' : '\xb1',
        result = '',
        $bench = $('#bench-' + id),
        $results = $bench.find('.fn-bench-result');

    $bench.find('.fn-run-bench').html(dictionary.runBenchmark);

    if (!event.target.error && event.target.aborted) {
        return;
    }

    if (error) {
      result += error.toString();
      $bench[0].classList.add('warning');
      $results[0].classList.add('error');
    } else {
      result += ' x ' + Benchmark.formatNumber(hz.toFixed(hz < 100 ? 2 : 0)) + ' ops/sec ' + pm +
        stats.rme.toFixed(2) + '%';
    }

    $results.html(result);
};

exports.drawSuite = function(suite) {
    var $suite = $(tmplSuite({
        fnstrip: fnstrip,
        hilite: hilite,
        suite: suite,
        dictionary: dictionary
    }));

    $('.fn-suites').append($suite);

    $suite.on('click', '.fn-run-suite', function(e) {
        e.preventDefault();
        suite.run();
    });

    $suite.on('click', '.fn-show-setup', function(e) {
        if (e.defaultPrevented) return;
        $('.suite-setup', $suite)[0].classList.toggle('hidden');
    });

    suite.suite
        .on('start', function() {
            $suite.find('.fn-run-suite').html(dictionary.stopSuite);
        })
        .on('complete', function(event) {
            $suite.find('.fn-run-suite').html(dictionary.runSuite);

            if (event.target.aborted) {
                return;
            }

            var fastest = this.filter('fastest'),
                delta;

            fastest.forEach(function(bench) {
                $('#bench-' + bench.id)[0].classList.add('fastest');
                $('#bench-' + bench.id + ' .fn-bench-status').html('(fastest)');
            });

            this.forEach(function(bench) {
                if (fastest.indexOf(bench) !== -1) return;

                delta = (Math.abs(bench.hz - fastest.pluck('hz')) / fastest.pluck('hz') * 100).toFixed(2);
                $('#bench-' + bench.id + ' .fn-bench-status').html('(' + delta + '% slower)');
            });
        })
        .on('cycle', onBenchComplete);
};

exports.drawBench = function(suite, bench) {
    var $suite = $('#' + suite.id),
        $bench = $(tmplBench({
            bench: bench,
            fnstrip: fnstrip,
            hilite: hilite,
            dictionary: dictionary
        })),
        $state = $bench.find('.fn-bench-state');

    $suite.find('.fn-benchs').append($bench);

    $bench.on('click', '.fn-run-bench', function(e) {
        e.preventDefault();
        suite.runBenchmark(bench.id);
    });

    $bench.on('click', '.fn-show-source', function(e) {
        if (e.defaultPrevented) return;
        $bench[0].classList.toggle('opened');
    });

    bench
        .on('start', function() {
            $bench[0].classList.remove('fastest');
            $bench[0].classList.remove('warning');
            $bench.find('.fn-bench-status, .fn-bench-result').html('');
            $bench.find('.fn-run-bench').html(dictionary.stopBenchmark);
        })
        .on('cycle', function() {
            $state.html(Benchmark.formatNumber(this.count) + ' (' + this.stats.sample.length + ' samples)');
        })
        .on('complete', onBenchComplete);
};
