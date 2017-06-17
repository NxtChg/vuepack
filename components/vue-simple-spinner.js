
Vue.component('vue-simple-spinner',
{
	template:
		'<div class="vue-simple-spinner" style="text-align: right">'+
			'<div :style="spinner_style"></div>'+
			'<div :style="text_style" v-if="message.length > 0">{{message}}</div>'+
		'</div>',

	style: '.vue-simple-spinner{ transition:all 0.3s linear } @keyframes vue-simple-spinner-spin { 0% { transform:rotate(0deg) } 100% { transform:rotate(360deg) } }',
	
	props:
	{
		'size': { default: 32 }, // either a number (pixel width/height) or 'tiny', 'small', 'medium', 'large', 'huge', 'massive' for common sizes
		'line-size': { type: Number, default: 3 },
		'line-bg-color': { type: String, default: '#eee' },
		'line-fg-color': { type: String, default: '#2196f3' }, // match .blue color to Material Design's 'Blue 500' color
		'speed':     { type: Number, default: 0.8 },
		'spacing':   { type: Number, default: 4 },
		'message':   { type: String, default: '' },
		'font-size': { type: Number, default: 13 },
		'text-fg-color': { type: String, default: '#555' }
	},

	methods:{ isNumber: function(n){ return !isNaN(parseFloat(n)) && isFinite(n); } },

	computed:
	{
		size_px: function()
		{
			switch(this.size)
			{
				case 'tiny':    return 12
				case 'small':   return 16
				case 'medium':  return 32
				case 'large':   return 48
				case 'big':     return 64
				case 'huge':    return 96
				case 'massive': return 128
			}
		
			return this.isNumber(this.size) ? this.size : 32;
		},

		line_size_px: function()
		{
			switch(this.size)
			{
				case 'tiny':    return 1
				case 'small':   return 2
				case 'medium':  return 3
				case 'large':   return 3
				case 'big':     return 4
				case 'huge':    return 4
				case 'massive': return 5
			}
			
			return this.isNumber(this.lineSize) ? this.lineSize : 4;
		},

		text_margin_top: function()
		{
			switch(this.size)
			{
				case 'tiny':
				case 'small':
				case 'medium':
				case 'large':
				case 'big':
				case 'huge':
				case 'massive': return Math.min(Math.max(Math.ceil(this.size_px/8), 3), 12);
			}
			
			return this.isNumber(this.spacing) ? this.spacing : 4;
		},

		text_font_size: function()
		{
			switch(this.size)
			{
				case 'tiny':
				case 'small':
				case 'medium':
				case 'large':
				case 'big':
				case 'huge':
				case 'massive': return Math.min(Math.max(Math.ceil(this.size_px*0.4), 11), 32)
			}
			
			return this.isNumber(this.fontSize) ? this.fontSize : 13;
		},
	
		spinner_style: function()
		{
			return{
				'margin':     '0 auto',
				'border-radius':'100%',
				'border':     this.line_size_px+'px solid '+this.lineBgColor,
				'border-top': this.line_size_px+'px solid '+this.lineFgColor,
				'width':      this.size_px+'px',
				'height':     this.size_px+'px',
				'animation': 'vue-simple-spinner-spin '+this.speed+'s linear infinite'
			}
		},

		text_style: function()
		{
			return{
				'margin-top': this.text_margin_top+'px',
				'color':      this.textFgColor,
				'font-size':  this.text_font_size+'px',
				'text-align': 'center'
			}
		}
	}
});
