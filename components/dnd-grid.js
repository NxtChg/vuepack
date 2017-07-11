
function dnd_isFree(layout, position)
{
	for(var i = 0; i < layout.length; i++)
	{
		if(layout[i].position.x < (position.x + position.w) &&
			(layout[i].position.x + layout[i].position.w) > position.x &&
			layout[i].position.y < (position.y + position.h) &&
			(layout[i].position.y + layout[i].position.h) > position.y)
			{
				return false;
			}
	}
	return true;
}

function dnd_moveToFreePlace(layout, boxLayout)
{
	var newBoxLayout = dnd_cloneBoxLayout(boxLayout);

	while(!dnd_isFree(layout, newBoxLayout.position)){ newBoxLayout.position.y++; }

	return newBoxLayout;
}

function dnd_cloneBoxLayout(b)
{
	return { id: b.id, hidden: b.hidden, pinned: b.pinned, position: { x: b.position.x, y: b.position.y, w: b.position.w, h: b.position.h } };
}

function dnd_cloneLayout(layout){ return layout.map(function(boxLayout){ return dnd_cloneBoxLayout(boxLayout); }); };

function dnd_positionToPixels(position, gridSize, margin, outerMargin)
{
	if(margin      === undefined) margin      = 0;
	if(outerMargin === undefined) outerMargin = 0;

	return {
		x: (position.x * gridSize.w) + ((position.x) * margin) + outerMargin,
		y: (position.y * gridSize.h) + ((position.y) * margin) + outerMargin,
		w: (position.w * gridSize.w) + ((position.w - 1) * margin),
		h: (position.h * gridSize.h) + ((position.h - 1) * margin)
	};
}

function dnd_getLayoutSize(layout)
{
	return {
		w: layout.reduce(function(width,  boxLayout){ return boxLayout.hidden ? width : Math.max(width,  boxLayout.position.x + boxLayout.position.w); }, 0),
		h: layout.reduce(function(height, boxLayout){ return boxLayout.hidden ? height: Math.max(height, boxLayout.position.y + boxLayout.position.h); }, 0)
	};
}

function dnd_sortLayout(layout)
{
	return layout.sort(function(a, b)
	{
		if( a.hidden && !b.hidden) return  1;
		if(!a.hidden &&  b.hidden) return -1;
		if( a.pinned && !b.pinned) return -1;
		if(!a.pinned &&  b.pinned) return  1;

		if(a.position.y < b.position.y) return -1;
		if(a.position.y > b.position.y) return  1;
		if(a.position.x < b.position.x) return -1;
		if(a.position.x > b.position.x) return  1;

		return 0;
	});
}

// check if element matches a selector, https://davidwalsh.name/element-matches-selector
function dnd_matchesSelector(el, selector)
{
	var p = Element.prototype;
	
	var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s){ return [].indexOf.call(document.querySelectorAll(s), this) !== -1; };

	return f.call(el, selector);
}
//_____________________________________________________________________________

Vue.component('dnd-grid-box',
{
	template: '<div :class="classes" :style="style" ref="dragHandle"><slot></slot><div class="resize-handle" ref="resizeHandle"></div></div>',

	style:
		'.dnd-grid-box{ position:absolute; z-index:1; box-sizing:border-box; }'+
		'.dnd-grid-box.dragging, .dnd-grid-box.resizing{ z-index:2; opacity:0.7 }'+
		'.dnd-grid-box:not(.dragging):not(.resizing){ transition: top ease-out 0.1s, left ease-out 0.1s, width ease-out 0.1s, height ease-out 0.1s; }'+
		'.resize-handle{ position:absolute; right:-5px; bottom:-5px; width:15px; height:15px; cursor:se-resize; }',
	
	props:{ boxid: { required: true }, dragselector: { type: String, default: '*' }	},

	data: function(){ return { dragging: false, resizing: false } },

	computed:
	{
		style: function()
		{
			var pixelPosition = this.$parent.getPixelPositionById(this.boxid);
			var visible       = this.$parent.isBoxVisible(this.boxid);

			return {
				display: visible? 'block' : 'none',
				width:  pixelPosition.w + 'px',
				height: pixelPosition.h + 'px',
				left:   pixelPosition.x + 'px',
				top:    pixelPosition.y + 'px'
			};
		},

		classes: function(){ return { 'dnd-grid-box': true, 'dragging': this.dragging, 'resizing': this.resizing } }
    },

	mounted: function()
	{
		// moving
		this.$dragHandle = this.$el || this.$refs.dragHandle;

		var self = this;

		this.$dragHandle.addEventListener('mousedown', function(evt)
		{
			if(!dnd_matchesSelector(evt.target, self.dragselector)) return;
	
			evt.preventDefault();
			self.dragging = true;
			self.$emit('dragStart');

			var mouseX = evt.clientX;
			var mouseY = evt.clientY;
	
			const handleMouseUp = function(evt)
			{
				window.removeEventListener('mouseup',   handleMouseUp,   true);
				window.removeEventListener('mousemove', handleMouseMove, true);
	
				self.dragging = false;
	
				var offset = { x: evt.clientX - mouseX, y: evt.clientY - mouseY };

				self.$emit('dragEnd', { offset: offset });
			};
	
			const handleMouseMove = function(evt)
			{
				var offset = { x: evt.clientX - mouseX, y: evt.clientY - mouseY };

				self.$emit('dragUpdate', { offset: offset });
			};
	
			window.addEventListener('mouseup',   handleMouseUp,   true);
			window.addEventListener('mousemove', handleMouseMove, true);
		});
		
		// resizing
		this.$resizeHandle = this.$refs.resizeHandle;
		if(this.$resizeHandle)
		{
			this.$resizeHandle.addEventListener('mousedown', function(evt)
			{
				evt.preventDefault();
				self.resizing = true;
				self.$emit('resizeStart');
	
				var mouseX = evt.clientX;
				var mouseY = evt.clientY;
		
				const handleMouseUp = function(evt)
				{
					window.removeEventListener('mouseup',   handleMouseUp,   true);
					window.removeEventListener('mousemove', handleMouseMove, true);
		
					self.resizing = false;
		
					var offset = { x: evt.clientX - mouseX, y: evt.clientY - mouseY };
	
					self.$emit('resizeEnd', { offset: offset });
				};
		
				const handleMouseMove = function(evt)
				{
					var offset = { x: evt.clientX - mouseX, y: evt.clientY - mouseY };
	
					self.$emit('resizeUpdate', { offset: offset });
				};
		
				window.addEventListener('mouseup',   handleMouseUp,   true);
				window.addEventListener('mousemove', handleMouseMove, true);
			});
		}
	}
});//__________________________________________________________________________

Vue.component('dnd-grid-container',
{
	template: '<div class="dnd-grid-container" :style="style"><slot></slot><dnd-grid-box class="placeholder" boxid="::placeholder::"></dnd-grid-box></div>',

	style:
		'.dnd-grid-container{ position:relative; transition: min-width ease-out 0.1s, min-height ease-out 0.1s; }'+
		'.dnd-grid-box.placeholder{ border:1px dashed #89f; background:none; z-index:0; transition: none !important; }',
	
	props:
	{
		layout:     { type: Array, required: true },
		gridSize:   { type: Object, default: function(){ return { w: 100, h: 100 }; } },
		margin:     { type: Number, default: 5 },
		outerMargin:{ type: Number, default: 0 }
	 },

	data: function()
	{
		return {
			placeholder: { hidden: true, position: { x: 0, y: 0, w: 1, h: 1 } },
			dragging: { boxLayout: null, offset: { x: 0, y: 0 } },
			resizing: { boxLayout: null, offset: { x: 0, y: 0 } }
		};
	},

	computed:
	{
		style: function()
		{
			var layoutSize = dnd_getLayoutSize(this.layout);

			return {
				minWidth:  ( (layoutSize.w * this.gridSize.w) + ((layoutSize.w - 1) * this.margin) + (2 * this.outerMargin) ) + 'px',
				minHeight: ( (layoutSize.h * this.gridSize.h) + ((layoutSize.h - 1) * this.margin) + (2 * this.outerMargin) ) + 'px'
			}
		},

		pinnedLayout: function(){ return this.layout.filter(function(boxLayout){ return boxLayout.pinned; }); }
    },

	methods:
	{
		getBoxLayoutById: function(id)
		{
			if(id === '::placeholder::') return this.placeholder;
		
		    for(var i = 0; i < this.layout.length; i++)
    	    {
    	    	if(this.layout[i].id == id) return this.layout[i];
    	    }

			//return this.layout.find(function(box){ return box.id === id; });
		},

		getPixelPositionById: function(id)
		{
			if(this.dragging.boxLayout && this.dragging.boxLayout.id === id)
			{
				var pixels = dnd_positionToPixels(this.dragging.boxLayout.position, this.gridSize, this.margin, this.outerMargin);

				pixels.x += this.dragging.offset.x;
				pixels.y += this.dragging.offset.y;

				return pixels;
			}

			if(this.resizing.boxLayout && this.resizing.boxLayout.id === id)
			{
				var pixels = dnd_positionToPixels(this.resizing.boxLayout.position, this.gridSize, this.margin, this.outerMargin);

				pixels.w += this.resizing.offset.x;
				pixels.h += this.resizing.offset.y;

				return pixels;
			}

			var boxLayout = this.getBoxLayoutById(id);

			return dnd_positionToPixels(boxLayout.position, this.gridSize, this.margin, this.outerMargin);
		},

		isBoxVisible: function(id){ var boxLayout = this.getBoxLayoutById(id); return !boxLayout.hidden; },

		getPositionByPixel: function(x,y)
		{
			return {
				x: Math.round(x / (this.gridSize.w + this.margin)),
				y: Math.round(y / (this.gridSize.h + this.margin))
			}
		},

		updateLayout: function(layout){ this.$emit('update:layout', layout); }
	},

	mounted: function()
	{
		var self = this;

		this.$children.forEach(function(box)
		{
			var initialLayout, isDragging = false, isResizing = false;

			box.$on('dragStart', function(evt)
			{
				var boxLayout = self.getBoxLayoutById(box.boxid);

				if(boxLayout.pinned) return;

				isDragging = true;
			
				// find box
				self.dragging.boxLayout = boxLayout;
				self.placeholder = dnd_cloneBoxLayout(self.dragging.boxLayout);
			
				// clone layout
				initialLayout = dnd_sortLayout(dnd_cloneLayout(self.layout));
			});

			box.$on('dragUpdate', function(evt)
			{
				if(!isDragging) return;

				self.dragging.offset.x = evt.offset.x;
				self.dragging.offset.y = evt.offset.y;

				var moveBy = self.getPositionByPixel(evt.offset.x, evt.offset.y);

				if(!dnd_isFree(self.pinnedLayout,
				{
					x: self.dragging.boxLayout.position.x + moveBy.x,
					y: self.dragging.boxLayout.position.y + moveBy.y,

					w: self.dragging.boxLayout.position.w,
					h: self.dragging.boxLayout.position.h
				}))
				{
					return;
				}

				self.placeholder.position.x = Math.max(0, self.dragging.boxLayout.position.x + moveBy.x);
				self.placeholder.position.y = Math.max(0, self.dragging.boxLayout.position.y + moveBy.y);

				var newLayout = [ self.placeholder ];
	
				initialLayout.forEach(function(boxLayout)
				{
					if(boxLayout.id === self.dragging.boxLayout.id) return;
	
					newLayout.push(dnd_moveToFreePlace(newLayout, boxLayout));
				});
	
				self.updateLayout(newLayout); // self.layout = newLayout; //self.layout.splice(0, self.layout.length, ...newLayout);
			});

			box.$on('dragEnd', function(evt)
			{
				if(!isDragging) return;

				var moveBy = self.getPositionByPixel(evt.offset.x, evt.offset.y);

				if(dnd_isFree(self.pinnedLayout,
				{
					x: self.dragging.boxLayout.position.x + moveBy.x,
					y: self.dragging.boxLayout.position.y + moveBy.y,
					w: self.dragging.boxLayout.position.w,
					h: self.dragging.boxLayout.position.h
				}))
				{
					self.placeholder.position.x = Math.max(0, self.dragging.boxLayout.position.x + moveBy.x);
					self.placeholder.position.y = Math.max(0, self.dragging.boxLayout.position.y + moveBy.y);
				}

				self.dragging.boxLayout.position.x = self.placeholder.position.x;
				self.dragging.boxLayout.position.y = self.placeholder.position.y;

				var newLayout = [ self.dragging.boxLayout ];

				initialLayout.forEach(function(boxPosition)
				{
					if(boxPosition.id === self.dragging.boxLayout.id) return;

					newLayout.push(dnd_moveToFreePlace(newLayout, boxPosition));
				});

				self.updateLayout(newLayout); // self.layout = newLayout; //self.layout.splice(0, self.layout.length, ...newLayout);

				self.dragging.boxLayout = null;
				self.dragging.offset.x = 0;
				self.dragging.offset.y = 0;

				self.placeholder.hidden = true;

				isDragging = false;
			});

			box.$on('resizeStart', function(evt)
			{
				var boxLayout = self.getBoxLayoutById(box.boxid);
				if(boxLayout.pinned) return;

				isResizing = true;

				// find box
				self.resizing.boxLayout = boxLayout;
				self.placeholder = dnd_cloneBoxLayout(self.resizing.boxLayout);

				// clone layout
				initialLayout = dnd_sortLayout(dnd_cloneLayout(self.layout));
			});

			box.$on('resizeUpdate', function(evt)
			{
				if(!isResizing) return;

				self.resizing.offset.x = evt.offset.x;
				self.resizing.offset.y = evt.offset.y;

				var resizeBy = self.getPositionByPixel(evt.offset.x, evt.offset.y);

				if(!dnd_isFree(self.pinnedLayout,
				{
					x: self.resizing.boxLayout.position.x,
					y: self.resizing.boxLayout.position.y,
					w: self.resizing.boxLayout.position.w + resizeBy.x,
					h: self.resizing.boxLayout.position.h + resizeBy.y
				}))
				{
					return;
				}

				self.placeholder.position.w = Math.max(1, self.resizing.boxLayout.position.w + resizeBy.x);
				self.placeholder.position.h = Math.max(1, self.resizing.boxLayout.position.h + resizeBy.y);

				var newLayout = [ self.placeholder ];

				initialLayout.forEach(function(boxLayout)
				{
					if(boxLayout.id === self.resizing.boxLayout.id) return;

					newLayout.push(dnd_moveToFreePlace(newLayout, boxLayout));
				});

				self.updateLayout(newLayout); // self.layout = newLayout; //self.layout.splice(0, self.layout.length, ...newLayout);
			});

			box.$on('resizeEnd', function(evt)
			{
				if(!isResizing) return;

				var resizeBy = self.getPositionByPixel(evt.offset.x, evt.offset.y);

				if (dnd_isFree(self.pinnedLayout,
				{
					x: self.resizing.boxLayout.position.x,
					y: self.resizing.boxLayout.position.y,
					w: self.resizing.boxLayout.position.w + resizeBy.x,
					h: self.resizing.boxLayout.position.h + resizeBy.y
				}))
				{
					self.placeholder.position.w = Math.max(1, self.resizing.boxLayout.position.w + resizeBy.x);
					self.placeholder.position.h = Math.max(1, self.resizing.boxLayout.position.h + resizeBy.y);
				}

				self.resizing.boxLayout.position.w = self.placeholder.position.w;
				self.resizing.boxLayout.position.h = self.placeholder.position.h;

				var newLayout = [ self.resizing.boxLayout ];

				initialLayout.forEach(function(boxPosition)
				{
					if(boxPosition.id === self.resizing.boxLayout.id) return;

					newLayout.push(dnd_moveToFreePlace(newLayout, boxPosition));
				});

				self.updateLayout(newLayout); // self.layout = newLayout; //self.layout.splice(0, self.layout.length, ...newLayout);

				self.resizing.boxLayout = null;
				self.resizing.offset.x = 0;
				self.resizing.offset.y = 0;

				self.placeholder.hidden = true;
			});
		});
	}
});
