
var onClickaway =
{
	bind: function(el, binding)
	{
		//unbind(el);

		var callback = binding.value; if(typeof callback !== 'function') return;
	
		// @NOTE: Vue binds directives in microtasks, while UI events are dispatched
		//        in macrotasks. This causes the listener to be set up before
		//        the "origin" click event (the event that lead to the binding of
		//        the directive) arrives at the document root. To work around that,
		//        we ignore events until the end of the "initial" macrotask.
		// @REFERENCE: https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
		// @REFERENCE: https://github.com/simplesmiler/vue-clickaway/issues/8
		var initialMacrotaskEnded = false;

		setTimeout(function(){ initialMacrotaskEnded = true; }, 0);
	
		el['_vue_clickaway_handler'] = function(ev)
		{
			// @NOTE: IE 5.0+
			// @REFERENCE: https://developer.mozilla.org/en/docs/Web/API/Node/contains
			if(initialMacrotaskEnded && !el.contains(ev.target)){ return callback(ev); }
		};
	
		document.documentElement.addEventListener('click', el['_vue_clickaway_handler'], false);
	},
	
	update: function(el, binding)
	{
		if(binding.value === binding.oldValue) return;

		bind(el, binding);
	},

	unbind: function(el)
	{
		document.documentElement.removeEventListener('click', el['_vue_clickaway_handler'], false);

		delete el['_vue_clickaway_handler'];
	}
};//___________________________________________________________________________

//var clickaway = { directives: { onClickaway: onClickaway } }; // mixin - not sure why...

Vue.directive('onClickaway', onClickaway);

