describe("B suite", function() {
  bench("String#match", function() {
    !! "Hello world".match(/o/);
  });

  bench("RegExp#test", function() {
    !! /o/.test("Hello world");
  });
});

describe("A suite", function(suite) {
  setup(function() {
    suite.text = "Hello world";
  });

  bench("String#match", function() {
    !! text.match(/o/);
  });

  bench("RegExp#test", function() {
    !! /o/.test(suite.text);
  });
});
