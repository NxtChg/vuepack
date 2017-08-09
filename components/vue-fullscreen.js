
Vue.component('fullscreen',
{
	template: '<div :style="active?[wrapperStyle]:[]" :class="active?[fullscreenClass]:[]" @click="shadeClick($event)"><slot></slot></div>',

	props:
	{
		background:      { type: String,  default: '#333' },
		fullscreenClass: { type: String,  default: 'fullscreen' },
		fullscreen:      { type: Boolean, default:  false }
	},

	data: function(){ return { fs_ok: false, active: false }; },

	computed:
	{
		wrapperStyle: function(){ return { background: this.background, 'overflow-y': 'auto', width: '100%', height: '100%' }; }
	},

	created: function()
	{
		var d = document;//.documentElement;

		//this.fs_ok = ('requestFullscreen' in d) || ('mozRequestFullScreen' in d && document.mozFullScreenEnabled) || ('webkitRequestFullScreen' in d);

		this.fs_ok = (d.fullscreenEnabled || d.mozFullScreenEnabled || d.webkitFullscreenEnabled || d.msFullscreenEnabled);
	},

	methods:
	{
		fs_status: function(){ var d = document; return (d.fullscreen || d.mozFullScreen || d.webkitIsFullScreen || false); }, // d.msFullscreenElement ?

		toggle: function(value)
		{
			if(value === undefined)
			{
				if(this.fs_status()) this.exit(); else this.enter();
			}
			else
			{
				value ? this.enter() : this.exit();
			}
		},

		enter: function()
		{
			if(this.fs_ok)
			{
				var d = document, e = this.$el;

				d.addEventListener('fullscreenchange',       this.fs_cb);
				d.addEventListener('mozfullscreenchange',    this.fs_cb);
				d.addEventListener('webkitfullscreenchange', this.fs_cb);
				d.addEventListener('MSFullscreenChange',     this.fs_cb);
	
				if(e.requestFullscreen      ) e.requestFullscreen();    else
				if(e.mozRequestFullScreen   ) e.mozRequestFullScreen(); else
				if(e.webkitRequestFullScreen) e.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT); else
				if(e.msRequestFullscreen    ) e.msRequestFullscreen();
			}
		},

		exit: function()
		{
			if(this.fs_ok)
			{
				var d = document;

				if(d.exitFullscreen        ) d.exitFullscreen();         else
				if(d.mozCancelFullScreen   ) d.mozCancelFullScreen();    else
				if(d.webkitCancelFullScreen) d.webkitCancelFullScreen(); else
				if(d.msExitFullscreen      ) d.msExitFullscreen();
			}
		},

		shadeClick: function(e){ if(e.target === this.$el) this.exit(); },

		fs_cb: function()
		{
			this.active = this.fs_status();

			if(!this.active)
			{
				var d = document;

				d.removeEventListener('fullscreenchange',       this.fs_cb);
				d.removeEventListener('mozfullscreenchange',    this.fs_cb);
				d.removeEventListener('webkitfullscreenchange', this.fs_cb);
				d.removeEventListener('MSFullscreenChange',     this.fs_cb);
			}

			this.$emit('change',            this.active);
			this.$emit('update:fullscreen', this.active);
		}
	},

	watch:
	{
		fullscreen: function(value){ if(value != this.fs_status()){ value ? this.enter() : this.exit(); } }
	}
});
