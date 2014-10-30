converge.js
===========

A library for chaining CSS transitions and events.

    converge.on('div.box').alter('open').then(function(e, elements) {
      // called after all transitions defined in the 'open' class are done
    }).thenOn('div.other-box').alter('open').then(function(e) {
      // thenOn lets you start altering another set of elements after the first set is complete
      e.wait(); // stop the chain and continue when you need to (good for async functions)
      net.json.get('/my/endpoint', function(data) {
        // do something with data...
        e.continue();
      });
    }).thenOn('div.more-boxes').alter('open').stagger(50).then(function(e, els) {
      // stagger lets you add delays in between each application of the css class.
    }).run(); // fire off the chain of transitions.
    
