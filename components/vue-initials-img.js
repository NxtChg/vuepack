
Vue.component('vue-initials-img',
{
	template: '<img :src="getImage"/>',

	props:{ name: String, shape: { type: String, default: 'round' }, size: { type: String, default: '50' } },

	computed:
	{
		getImage: function(){ return this.getDataURI(this.name, this.size); }
	},
	
	methods:
	{
		getDataURI: function(name, size)
		{
			name = name || '';
			size = size || 60;
	
			var colours = [
				'#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
				'#f1c40f', '#e67e22', '#e74c3c', '#ecf0f1', '#95a5a6', '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
			];
	
	        var initials, charIndex, colourIndex, canvas, ctx, dataURI;

			var nameSplit = (''+name).toUpperCase().split(' ');
	
			if(nameSplit.length == 1)
			{
				initials = nameSplit[0] ? nameSplit[0].charAt(0) : '?';
			}
			else
			{
				initials = nameSplit[0].charAt(0) + nameSplit[nameSplit.length-1].charAt(0);
			}
	
			if(window.devicePixelRatio){ size *= window.devicePixelRatio; }
	
			charIndex = (initials == '?' ? 72 : initials.charCodeAt(0)) - 64;
			colourIndex = charIndex % 20;

			canvas = document.createElement('canvas');
			canvas.width  = size;
			canvas.height = size;
			ctx = canvas.getContext('2d');
	
			ctx.fillStyle = colours[colourIndex-1];

			var x = canvas.width/2 | 0, y = canvas.height/2 | 0;

			if(this.shape == 'round')
			{
				ctx.beginPath();
				ctx.arc(x, y, Math.min(x, y), 0, Math.PI*2);
				ctx.fill();
			}
			else
			{
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}

			ctx.font = Math.round(canvas.width*0.45) + 'px sans-serif';
			ctx.textAlign = 'center';
			ctx.fillStyle = '#FFF';
			ctx.fillText(initials, size / 2, size / 1.5);
	
			dataURI = canvas.toDataURL(); canvas = null;
	
			return dataURI;
		}
	}
});
