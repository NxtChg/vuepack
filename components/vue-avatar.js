
Vue.component('avatar',
{
	template: '<div><div class="avatar" :style="style"><span v-if="!this.src">{{ userInitial }}</span></div></div>',

	props:
	{
		username: { type: String, required: true },
		initials: { type: String },
		backgroundColor: { type: String },
		color:    { type: String },
		size:     { type: Number, default: 50 },
		src:      { type: String },
		rounded:  { type: Boolean, default: true },
		lighten:  { type: Number, default: 80 }
	},
	
	data: function(){ return{ backgroundColors: [ '#F44336', '#FF4081', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', /*'#FFEB3B',*/ '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'] }; },
	
	mounted: function(){ this.$emit('avatar-initials', this.username, this.userInitial); },
	
	computed:
	{
		background: function(){ return this.backgroundColor || this.pick_bg_color(this.username.length, this.backgroundColors); },
	
		style: function()
		{
			var s = { width: this.size+'px', height: this.size+'px', borderRadius: (this.rounded ? '50%' : 0), textAlign: 'center', verticalAlign: 'middle' };
	
	        if(this.src !== undefined)
			{
				s.background       = 'url('+this.src+') no-repeat';
				s.backgroundSize   = this.size+'px ' + this.size+'px';
				s.backgroundOrigin = 'content-box';
			}
			else
			{
				s.backgroundColor = this.background;
				s.font       = Math.floor(this.size / 2.5) + 'px/100px Helvetica, Arial, sans-serif';
				s.fontWeight = 'bold';
				s.color      = this.color || this.lighten(this.background, this.lighten);
				s.lineHeight = (this.size + Math.floor(this.size / 20)) + 'px';
			}

			return s;
		},
	
		userInitial: function(){ return (this.initials || this.initial(this.username)); }
	},
	
	methods:
	{
		initial: function(username)
		{
			var parts = username.split(/[ -]/), initials = '';
	
			for(var i = 0; i < parts.length; i++) initials += parts[i].charAt(0);
	
			if(initials.length > 3 && initials.search(/[A-Z]/) !== -1){ initials = initials.replace(/[a-z]+/g, ''); }
	
			initials = initials.substr(0, 3).toUpperCase();
	
			return initials;
		},
	
		pick_bg_color: function(seed, colors){ return colors[seed % colors.length]; },
	
		lighten: function(hex, amt) // From https://css-tricks.com/snippets/javascript/lighten-darken-color/
		{
			var usePound = false;
			
			if(hex[0] === '#'){ hex = hex.slice(1); usePound = true; }
			
			var num = parseInt(hex, 16);
			var r = (num >> 16)           + amt; if(r > 255) r = 255; else if(r < 0) r = 0;
			var b = ((num >> 8) & 0x00FF) + amt; if(b > 255) b = 255; else if(b < 0) b = 0;
			var g = (num      & 0x0000FF) + amt; if(g > 255) g = 255; else if(g < 0) g = 0;
			
			return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
		}
	}
});
