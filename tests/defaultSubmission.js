"use strict";
casper.test.begin('Default submission.', 2, function suite(test) {
  casper.start("http://localhost:3000", function(response) {
    this.echo('Connect response is: ' + response.statusText, "INFO");
  });

  casper.waitForSelector('input[name="theurl"]',
    function() {
      this.echo("The input field named 'theurl' was found.", "INFO");
      test.assertEval(function() {
        return document.activeElement.id === 'theurl';
      }, "The input field is active by default.");
    },
    function() {
      this.echo("The input field named 'theurl' was not found.", "ERROR");
    },
    1500
  );

  casper.then(function() {
    this.sendKeys('#theurl', '\n');
    this.echo('Data has request has been sent to default url.', "INFO");
  });

  casper.waitWhileSelector('#theurl[disabled]', function() {
    this.echo('Data request has returned.', "INFO");
  });

  casper.then(function() {
    test.assertEval(function() {
      return document.getElementById('dataTableBody').children.length > 9;
    }, "At least ten html tags were found.");
  });

  casper.run(function() {
    test.done();
  });
});
