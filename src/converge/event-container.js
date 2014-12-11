define('converge/event-container',

       [],

function() {

  function EventContainer(opts) {
    this.nextRun = opts.nextRun;
    this.waitForContinue = false;
  }
  
  EventContainer.prototype.resume = function() {
    this.waitForContinue = false;
    return this.nextRun();
  };

  EventContainer.prototype.wait = function() {
    this.waitForContinue = true;
  };

  return EventContainer;

});
