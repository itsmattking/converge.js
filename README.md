converge.js
===========

A library for chaining CSS transitions and events.

* Sequence CSS transitions and callbacks via JavaScript with a simple and intuitive API.
* Smooth over handling of multiple concurrent transitions and only firing events after they are complete.

Instead of directly manipulating CSS values, converge.js expects the transitions
to be applied via CSS, then triggered by manipulation of classes on the DOM.

Usage
=====

First, pass in a DOM selector, an array of elements, or a NodeList.

    converge.on('div.box')
	
Then specify the CSS class of the elements you want to alter:

	.alter('open')
	
Finally, specify a function you want to run after the transitions are finished.

	.then(function(e, elements) {
	// ...
	})

To continue in same chain, select another group of elements by using `thenOn`:

    .thenOn('div.other-box').alter('open').then(function(e) {
	// ...
	})

You must call `run` at the end of your chain to kick off the chain of events:

	.run();

Waiting and continuing
======================

The callback function you specify in `then` will get an event object that has a `wait` method.
This will pause the events and wait for you to continue them yourself. It's handy if you
have other asynchronous things you want to do after a transition.

	converge.on('div.box').alter('open').then(function(e) {
      e.wait(); // stop the chain and continue when you need to (good for async functions)
      net.json.get('/my/endpoint', function(data) {
        // do something with data...
        e.continue();
      });
    }).run();

Timing
======

You can alter timing of the application of classes by using the `stagger` method.

	// This will add 50ms delay to each application of the class on the element
	converge.on('div.box').alter('open').stagger(50).then(function(e) {
	// ...
	}).run();

See `demo/demo.js` and `demo/demo.html` for more examples.

Developing
==========

You'll need node installed to develop converge.js. Just clone the repo and run `npm install` to get set up.

`grunt` is used to manage build and development tasks:

* `grunt` (with no arguments) starts up the test API server, testing/linting/compiling on file changes.
* `grunt build` does the test/lint/compile once and exits.

You'll also need to `npm install grunt-cli`.

