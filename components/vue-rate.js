
Vue.component('rate',
{
	template:
		'<div class=rate v-if="length > 0">'+
			//'<svg style="position:absolute; width:0; height:0;" width=0 height=0 version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>'+
			'<svg style="position:absolute; width:0; height:0;" width=0 height=0 version="1.1"><defs>'+
				'<symbol id="icon-star-empty" viewBox="0 0 32 32">'+
				//	'<title>star-empty</title>'+
					'<path d="M32 12.408l-11.056-1.607-4.944-10.018-4.944 10.018-11.056 1.607 8 7.798-1.889 11.011 9.889-5.199 9.889 5.199-1.889-11.011 8-7.798zM16 23.547l-6.983 3.671 1.334-7.776-5.65-5.507 7.808-1.134 3.492-7.075 3.492 7.075 7.807 1.134-5.65 5.507 1.334 7.776-6.983-3.671z"></path>'+
				'</symbol>'+
				'<symbol id="icon-star-full" viewBox="0 0 32 32">'+
				//	'<title>star-full</title>'+
					'<path d="M32 12.408l-11.056-1.607-4.944-10.018-4.944 10.018-11.056 1.607 8 7.798-1.889 11.011 9.889-5.199 9.889 5.199-1.889-11.011 8-7.798z"></path>'+
				'</symbol>'+
			'</defs></svg>'+
			'<input type=hidden :name="name" :value="rate" v-model="rate" :required="required">'+
			'<template v-for="n in length">'+
			'<a href="javascript:;" :class="{star: true, hover: n <= over, filled: n <= rate}" @mouseover="onOver(n)" @mouseout="onOut(n)" @click="setRate(n)" @keyup="onOver(n)" @keyup.enter="setRate(n)">'+
				'<svg class=icon v-show="isFilled(n)"><use xlink:href="#icon-star-full"></use></svg>'+
				'<svg class=icon v-show="isEmpty(n)"><use xlink:href="#icon-star-empty"></use></svg>'+
			'</a>'+
			'</template>'+
			'<div class=view>'+
				'<span class=count v-if="showcount">{{over}}</span>'+
				'<span class=desc  v-if="ratedesc.length > 0">{{ratedesc[over-1]}}</span>'+
			'</div>'+
		'</div>',

	style:
		'.icon{ display:inline-block; width:1.25em; height:1.25em; stroke-width:0; stroke:currentColor; fill:currentColor; vertical-align:middle; margin:0 5px; }'+
		'.view .count, .view .desc{ display:inline-block; vertical-align:middle; padding:5px; }'+
		'.star{ color:#aaa; display:inline-block; padding:7px 0; text-decoration:none; cursor:pointer; }'+
		'.star.hover{ color:#fc1; opacity:0.4; }'+
		'.star:hover, .star.hover:hover{ color:#f00; opacity:1; }'+
		'.star.filled{ color:#fc1; opacity:1; }',

	props:
	{
		value:  Number,
		length: Number,
		name: {type: String, default: 'rate'},
		showcount: Boolean,
		required:  Boolean,
		ratedesc: { type: Array, default: function(){ return []; } }
	},

	data: function(){ return { over: 0, rate: 0 } },

	created: function()
	{
		if(this.value >= this.length){ this.value = this.length; } else
		if(this.value < 0){ this.value = 0; }

		this.rate = this.value;
		this.over = this.value;
	},

	methods:
	{
		onOver: function(index){ this.over = index },
		onOut:  function(){ this.over = this.rate },
		
		setRate: function(index)
		{
			this.$emit('beforeRate', this.rate);
			this.rate = index;
			this.$emit('afterRate', this.rate);
		},

		isFilled: function(index){ return index <= this.over },
		isEmpty:  function(index){ return index > this.over || !this.value && !this.over; }
	}
});
