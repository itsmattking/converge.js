# converge.js

A library for chaining CSS transitions and callbacks.

* Sequence CSS transitions and callbacks via JavaScript with a simple and intuitive API.
* Smooth over handling of multiple concurrent transitions and only firing events after they are complete.

Instead of directly manipulating CSS properties of elements, converge.js expects the transitions
to be applied via CSS declarations, then triggered by manipulation of classes on the DOM.

## CodePen [live demo is here](http://codepen.io/mattking17/pen/ByZMEK/left/?editors=011)

There are also examples in `demo/`. Change into the `demo/` directory, execute `run.sh` and
browse to http://127.0.0.1:8080/.

## Usage

First, pass in a DOM selector, an array of elements, or a NodeList.

    converge.on('div.box') // selector style
	converge.on(document.querySelectorAll('div.box')) // a list of elements from querySelectorAll
	converge.on($('div.box')) // a list of elements from jQuery
	converge.on(myElements) // a list of elements you already have
	
Then specify the CSS class of the elements you want to alter:

	.alter('open')
	
To *remove* a class, use a `-`:

	.alter('-open')
	
For multiple classes, just pass multiple arguments; they will be altered in order:

	.alter('open', 'otherclass')
	
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

### Waiting and resuming

The callback function you specify in `then` will get an event object that has a `wait` method.
This will pause the events and wait for you to resume them yourself. It's handy if you
have other asynchronous things you want to do after a transition.

	converge.on('div.box').alter('open').then(function(e) {
      e.wait(); // stop the chain and resume when you need to (good for async functions)
      net.json.get('/my/endpoint', function(data) {
        // do something with data...
        e.resume();
      });
    }).run();

### Timing

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

Also note that there is a `delay` function as well to add delays to applying classes:

	converge.on('div.box').delay(1000).alter('open').then(function(e) {
	// ...
	}).run();

### Preloading Images

A utility for preloading images is included in converge.js. Preloading images is handy when you
want to reveal or transition images, but only after they are fully downloaded.

	// Preload an image and then transition it in
	converge.preload('/path-to-large-image.jpg').thenOn('img.large').alter('open');
	
## Tips and Troubleshooting

### CSS Declarations

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
	
## Browser support

### Running in browsers without transition support/applying to non-transitioned elements

Converge.js will gracefully handle running in browsers without CSS transition support, as well as
running on elements that have no transitions defined, by altering the requested class names and 
running the callbacks as normal. Timing defined with `stagger` and `delay` will also be respected
when in unsupported/non-transitioned situations.

### IE 7 support

IE 7 does not support `querySelectorAll` which is what converge.js uses when passed a selector string
to the `.on` method. If you care about IE 7 support, pass a selection of elements instead of a selector string,
for example with jQuery:

	converge.on($('.box'))
	
## Developing

You'll need node installed to develop converge.js. Just clone the repo and run `npm install` to get set up.

`grunt` is used to manage build and development tasks:

* `grunt` (with no arguments) starts up the test API server, testing/linting/compiling on file changes.
* `grunt build` does the test/lint/compile once and exits.

You'll also need to `npm install grunt-cli`.

