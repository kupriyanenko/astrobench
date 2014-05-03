var $ = require('jbone'),
    _ = require('lodash'),
    tmplApp = require('./templates/app.html'),
    tmplSuite = require('./templates/suite.html'),
    tmplBench = require('./templates/bench.html');

$('#astrobench').html(tmplApp());

$('.fn-run-tests').on('click', function(e) {
    e.preventDefault();

    setTimeout(run, 100);
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
        $results = $('#bench-' + id + ' .fn-bench-result');

    if (error) {
      result += error.toString();
      $('#bench-' + id)[0].classList.add('warning');
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
        suite: suite
    }));

    $('.fn-suites').append($suite);

    $suite.on('click', '.fn-run-suite', function(e) {
        e.preventDefault();

        suite.suite.run({
            async: true
        });
    });

    $suite.on('click', '.fn-show-setup', function(e) {
        if (e.defaultPrevented) return;

        $('.suite-setup', $suite)[0].classList.toggle('hidden');
    });

    suite.suite
        .on('complete', function(event) {
            var fastest = this.filter('fastest'),
                delta;

            _.each(fastest, function(bench) {
                $('#bench-' + bench.id)[0].classList.add('fastest');
                $('#bench-' + bench.id + ' .fn-bench-status').html('(fastest)');
            });

            this.forEach(function(suite) {
                if (fastest.indexOf(suite) !== -1) return;

                delta = (Math.abs(suite.hz - fastest.pluck('hz')) / fastest.pluck('hz') * 100).toFixed(2);
                $('#bench-' + suite.id + ' .fn-bench-status').html('(' + delta + '% slower)');
            });
        })
        .on('cycle', onBenchComplete);
};

exports.drawBench = function(suite, bench) {
    var $suite = $('#' + suite.id),
        $bench = $(tmplBench({
            bench: bench,
            fnstrip: fnstrip,
            hilite: hilite
        })),
        $state = $bench.find('.fn-bench-state');

    $suite.find('.fn-benchs').append($bench);

    $bench.on('click', '.fn-run-bench', function(e) {
        e.preventDefault();

        bench.run({
            async: true
        });
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
        })
        .on('cycle', function() {
            $state.html(Benchmark.formatNumber(this.count) + ' (' + this.stats.sample.length + ' samples)');
        })
        .on('complete', onBenchComplete);
};
