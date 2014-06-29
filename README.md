# Astrobench

[![NPM version](https://badge.fury.io/js/astrobench.png)](http://badge.fury.io/js/astrobench)
[![Bower version](https://badge.fury.io/bo/astrobench.png)](http://badge.fury.io/bo/astrobench)

> Make the Web Faster

JavaScript library for running in the browser performance benchmarks, based on Benchmark.js. [Live Demo](https://kupriyanenko.github.io/astrobench/demo.html)

Easy way to create test cases. Provides rich and pretty UI.

![](https://cdn.rawgit.com/kupriyanenko/astrobench/gh-pages/astro.png)

## Installation

Install with [bower](http://bower.io/)

```
$ bower install astrobench --save
```

Or with [npm](https://www.npmjs.org/)

```
$ npm install astrobench --save
```

## Use it

```html
$ bower install astrobench --save
$ $EDITOR tests.html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Performance tests</title>
  <link rel="stylesheet" href="bower_components/astrobench/src/style.css">
</head>
<body>
  <!-- wrapper for tests -->
  <div id="astrobench"></div>

  <script src="bower_components/astrobench/dist/astrobench.js"></script>
  <script>
    // Simple synchronous benchmarks
    suite('A suite', function() {
      bench('String#match', function() {
        !! 'Hello world'.match(/o/);
      });

      bench('RegExp#test', function() {
        !! /o/.test('Hello world');
      });
    });

    // Suite with async benchmarks
    suite('B suite', function(suite) {
      // Setup for suite, run once
      setup(function() {
        suite.text = 'Hello world';
      });

      // Benchmark with error, text is not defined
      bench('Benchmark with error', function() {
        !! text.match(/o/);
      });

      // Asynchronous benchmark, takes on first argument deferred object
      bench('Deferred benchmark', function(deferred) {
        !! /o/.test(suite.text);

        setTimeout(function() {
          deferred.resolve();
        }, 100);
      },
      // Options for current benchmark
      {
        defer: true
      });
    });
  </script>
</body>
</html>
```

And enjoy the result.

![](https://cdn.rawgit.com/kupriyanenko/astrobench/gh-pages/screen.png)
