describe("A suite", function() {
  var one;

  setup(function(suite) {
    one = 100;
  });

  bench("String#match", function() {
    !! "Hello world".match(/o/);
  });

  bench("RegExp#test", function() {
    !! /o/.test("Hello world");
  });
});

describe("B suite", function() {
  bench("String#match", function() {
    !! "Hello world".match(/o/);
  });

  bench("RegExp#test", function() {
    !! /o/.test("Hello world");
  });
});
