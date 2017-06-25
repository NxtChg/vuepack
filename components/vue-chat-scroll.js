
var VueChatScroll =
{
 install: function(Vue, options)
 {
	 Vue.directive('chat-scroll',
	 {
		bind: function(el, binding)
		{
			var timeout, scrolled = false;
			
			el.addEventListener('scroll', function(e)
			{
				if(timeout) clearTimeout(timeout);
				
				timeout = setTimeout(function(){ scrolled = el.scrollTop + el.clientHeight + 1 < el.scrollHeight; }, 200);
			});
			
			(new MutationObserver(function(e)
			{
				var config = binding.value || {};
				var pause = config.always === false && scrolled;

				if(pause || e[e.length - 1].addedNodes.length != 1) return;

				el.scrollTop = el.scrollHeight; // scrollToBottom

			})).observe(el, {childList: true});
		},
		inserted: function(el){ el.scrollTop = el.scrollHeight; } //scrollToBottom
 	});
 }
};

Vue.use(VueChatScroll);
