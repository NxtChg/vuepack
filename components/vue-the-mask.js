
function maskit(value, mask, masked, tokens)
{
	value = value || "";

	var iMask = 0, iValue = 0, output = '';

	while(iMask < mask.length && iValue < value.length)
	{
		var cMask  =   mask[iMask];
		var masker = tokens[cMask];
		var cValue =  value[iValue];

		if(masker && !masker.escape)
		{
			if(masker.pattern.test(cValue))
			{
				output += masker.transform ? masker.transform(cValue) : cValue;
				
				iMask++;
			}
			iValue++;
		}
		else
		{
			if(masker && masker.escape)
			{
				iMask++; // take the next mask char and treat it as char
				cMask = mask[iMask];
			}
			if(masked) output += cMask;
			if(cValue === cMask) iValue++; // user typed the same char
			iMask++;
		}
	}
	
	// fix mask that ends with a char: (#)
	var restOutput = '';

	while(iMask < mask.length && masked)
	{
		var cMask = mask[iMask++];

		if(tokens[cMask]){ restOutput = ''; break; }

		restOutput += cMask;
	}
	
	return output + restOutput;
}//____________________________________________________________________________

function dynamicMask(masks, tokens)
{
	masks = masks.sort(function(a, b){ return a.length - b.length; });

	return function(value, mask, masked)
	{
		var i = 0;
		
		while(i < masks.length)
		{
			var currentMask = masks[i++];
			var nextMask    = masks[i];

			if(!(nextMask && maskit(value, nextMask, true, tokens).length > currentMask.length)) return maskit(value, currentMask, masked, tokens);
		}
		return ''; // empty masks
	};
}//____________________________________________________________________________

Vue.component('the-mask',
{
	template: '<input :type="type" @input="refresh($event.target.value)" :placeholder="placeholderOrMask">',

	props:
	{
	    value: String,
	    mask:   { type: [String, Function, Array], required: true },
	    masked: { type: Boolean, default: false }, // raw // by default emits the value unformatted, change to true to format with the mask
	    placeholder: { type: String },
	    type:   { type: String, default: 'text' },
	    tokens:
	    {
	    	type: Object,
	    	default: function(){ return {
				'#': {pattern: /\d/},
				'X': {pattern: /[0-9a-zA-Z]/},
				'S': {pattern: /[a-zA-Z]/},
				'A': {pattern: /[a-zA-Z]/, transform: function(v){ return v.toLocaleUpperCase(); } },
				'a': {pattern: /[a-zA-Z]/, transform: function(v){ return v.toLocaleLowerCase(); } },
				'!': {escape: true}
				};
			}
 		}
	},

	data: function(){ return { result: '' }; },

	mounted: function(){ this.refresh(this.value); }, // can't watch value immediate cause display access $el that doesn't exists before mounted

	watch:
	{
		value: function(newValue)
		{
			if(newValue === this.result) return; // don't update if value is the same as last value

			this.refresh(newValue);
		},

		mask:   function(){ this.refresh(this.getDisplay()); },
		masked: function(){ this.refresh(this.getDisplay()); },
	},

	computed:
	{
		placeholderOrMask: function()
		{
			if(this.placeholder === undefined || this.placeholder === null)
			{
				return (typeof this.convertedMask === 'function') ? '' : this.convertedMask;
			}
			else
			{
				return this.placeholder;
			}
		},

		convertedMask: function()
		{
			return Array.isArray(this.mask) ? dynamicMask(this.mask, this.tokens) : this.mask;
		},

		masker: function(){ return (typeof this.convertedMask === 'function') ? this.convertedMask : maskit; }
	},

	methods:
	{
		refresh: function(newValue)
		{
			newValue = newValue ||  '';

			var position = this.getPosition(); // save position before setDisplay

			this.setDisplay(this.masker(newValue, this.convertedMask, true, this.tokens)); // set display with mask, cursor goes to end

			var oldResult = this.result;

			this.result = this.masker(newValue, this.convertedMask, this.masked, this.tokens); // emit masked or raw
			
			if(oldResult != this.result) // emit only if changed
			{
				this.$emit('input', this.result);

				var subNewValue = newValue.substring(0, position);
				var subDisplay  = this.getDisplay().substring(0, position);

				if(subNewValue !== subDisplay)
				{
					var digit = subNewValue[position-1]; // fix double char position bug: (44| + 9 => (44) 9|

					while(position < this.getDisplay().length && this.getDisplay().charAt(position-1) !== digit) // avoid infinite loop
					{
						position++;
					}
				}
			}
			this.setPosition(position);
		},

		// used only for asserting the cursor position during e2e tests
		emitCursor: function(){ this.$emit('cursor', this.getPosition()); },

		// can't use computed because vue caches it
		getPosition: function(){ return this.$el.selectionEnd || 0 },
		setPosition: function(p)
		{
			// update cursor only if the input has focus
			if(this.$el === document.activeElement)
			{
				this.$el.setSelectionRange(p, p);
				this.emitCursor();
			}
		},
		getDisplay: function(){ return this.$el.value || ''; },
		setDisplay: function(v){ this.$el.value = v; }
	}
});
