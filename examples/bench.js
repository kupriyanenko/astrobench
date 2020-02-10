suite('A suite', function() {
  bench('String#match', function() {
    !! 'Hello world'.match(/o/);
  });

  bench('RegExp#test', function() {
    !! /o/.test('Hello world');
  });
});

suite('B suite', function(suite) {
  beforeBench(function() {
    suite.text = 'Hello world';
  });

  bench('Benchmark with error', function() {
    !! text.match(/o/);
  });

  bench('Deferred benchmark', function(deferred) {
    !! /o/.test(suite.text);

    setTimeout(function() {
      deferred.resolve();
    }, 100);
  }, { defer: true });
});
