function apiUrl(uri) {
	return ['http://127.0.0.1:8000', uri.replace(/^\/+/, '')].join('/');
}

function asyncHandler(func) {
	return function() {
		start();
		func.apply(func, Array.prototype.slice.call(arguments, 0));
	};
}

function noError() {
	return asyncHandler(function(req) {
		window.console.log('Error called when not expected', Array.prototype.slice.call(arguments, 0).join(', '));
		ok(false, 'Should not call the error function');
	});
}

function noSuccess() {
	return asyncHandler(function() {
		window.console.log('Success called when not expected', Array.prototype.slice.call(arguments, 0).join(', '));
		ok(false, 'Should not call the success function');
	});
}

