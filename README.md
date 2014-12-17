converge.js
===========

A library for chaining CSS transitions and callbacks.

* Sequence CSS transitions and callbacks via JavaScript with a simple and intuitive API.
* Smooth over handling of multiple concurrent transitions and only firing events after they are complete.

Instead of directly manipulating CSS properties of elements, converge.js expects the transitions
to be applied via CSS declarations, then triggered by manipulation of classes on the DOM.

Usage
=====

First, pass in a DOM selector, an array of elements, or a NodeList.

    converge.on('div.box')
	
Then specify the CSS class of the elements you want to alter:

	.alter('open')
	
Finally, specify a function you want to run after the transitions are finished.

	.then(function(e, elements) {
	// A sparse event object and the collection of elements is passed to this function
	})

To continue in same chain, select another group of elements by using `thenOn`:

    .thenOn('div.other-box').alter('open').then(function(e) {
	// ...
	})

You must call `run` at the end of your chain to kick it off:

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

	// This will add 50ms delay to each application of the class on the element.
	// Each time 50ms is *added*, so the first element will have a 0ms delay,
	// the second element will have a 50ms delay, then 100ms on the following, etc.
	converge.on('div.box').alter('open').stagger(50).then(function(e) {
	// ...
	}).run();

A second argument to `stagger` will add a baseline delay. Adding this while setting the
first argument to `0` will effectively add a delay execution down the chain. Note that you can also
achieve this by adding a `transition-delay` declaration in your CSS.

	// Each application of the timing will now be 1000ms, 1050ms, 1100ms, etc.
	converge.on('div.box').alter('open').stagger(50, 1000).then(function(e) {
	// ...
	}).run();

Preloading Images
=================

A utility for preloading images is included in converge.js. Preloading images is handy when you
want to reveal or transition images, but only after they are fully downloaded.

	// Preload an image and then transition it in
	converge.preload('/path-to-large-image.jpg').thenOn('img.large').alter('open');
	
Tips and Troubleshooting
========================

CSS Declarations
----------------

Converge.js needs to know which properties to watch and wait for, so when declaring CSS transitions,
be sure that you are explicit:

	/* This will not work with converge.js, it's too ambiguous. */
	div.box {
		transition: all .3s ease-in-out;
	}
	
	/* This will work */
	div.box {
		transition: opacity .3s ease-in-out;
	}
	
You will also have to be specific about your properties and timings for multiple property transitions.

	div.box {
		transition-property: opacity, transform;
		transition-duration: .3s, .5s;
		transition-timing-function: ease-out, ease-in-out;
	}

Remember do prefix your transitions properly. Either do it by hand or rely on
a CSS framework to generate them for you.

	div.box {
		-webkit-transition: -webkit-transform .3s ease-in-out;
		transition: transform .3s ease-in-out;
	}
	
Demo
====

Files in `demo/` show some ways to use converge.js. You can also change into the `demo/` directory and
execute `run.sh` and browse to http://127.0.0.1:8080/.

Developing
==========

You'll need node installed to develop converge.js. Just clone the repo and run `npm install` to get set up.

`grunt` is used to manage build and development tasks:

* `grunt` (with no arguments) starts up the test API server, testing/linting/compiling on file changes.
* `grunt build` does the test/lint/compile once and exits.

You'll also need to `npm install grunt-cli`.

