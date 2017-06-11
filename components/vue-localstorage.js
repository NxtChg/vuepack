
function VueLocalStorage(){ this._properties = {}; }

/**
 * Get value from localStorage
 *
 * @param {String} lsKey
 * @param {*} defaultValue
 * @returns {*}
 */
VueLocalStorage.prototype.get = function(lsKey, defaultValue)
{
	var this$1 = this;

	if(defaultValue === void 0) defaultValue = null;
	
	if(window.localStorage[lsKey])
	{
		var type = String;
		
		for(var key in this$1._properties)
		{
			if(key === lsKey){ type = this$1._properties[key].type; break; }
		}
		
		return this._process(type, window.localStorage[lsKey]);
	}
	
	return (defaultValue !== null ? defaultValue : null);
};

/**
 * Set localStorage value
 *
 * @param {String} lsKey
 * @param {*} value
 * @returns {*}
 */
VueLocalStorage.prototype.set = function(lsKey, value)
{
	var this$1 = this;
	
	for(var key in this$1._properties)
	{
		var type = this$1._properties[key].type;
	
		if((key === lsKey) && (type === Array || type === Object))
		{
			window.localStorage.setItem(lsKey, JSON.stringify(value));
	
			return value;
		}
	}
	
	window.localStorage.setItem(lsKey, value);
	
	return value
};

/**
 * Remove value from localStorage
 *
 * @param {String} lsKey
 */
VueLocalStorage.prototype.remove = function(lsKey){ return window.localStorage.removeItem(lsKey); };

/**
 * Add new property to localStorage
 *
 * @param {String} key
 * @param {function} type
 * @param {*} defaultValue
 */
VueLocalStorage.prototype.addProperty = function(key, type, defaultValue)
{
	type = type || String;
	
	this._properties[key] = { type: type };
	
	if(!window.localStorage[key] && defaultValue !== null)
	{
		window.localStorage.setItem(key, (type === Array || type === Object) ? JSON.stringify(defaultValue) : defaultValue);
	}
};

/**
 * Process the value before return it from localStorage
 *
 * @param {String} type
 * @param {*} value
 * @returns {*}
 * @private
 */
VueLocalStorage.prototype._process = function(type, value)
{
	switch(type)
	{
		case Boolean: return value === 'true';
		case Number:  return parseInt(value, 10);
		case Array:   try{ var array = JSON.parse(value); return (array.constructor === Array ? array : []); } catch(e){ return []; }
		case Object:  try{ return JSON.parse(value); } catch(e){ return {}; }
	}

	return value;
};

try
{
	var test = '__vue-localstorage-test__';
	
	window.localStorage.setItem(test, test);
	window.localStorage.removeItem(test);
}
catch(e){ console.error('Local storage is not supported'); }

var vueLocalStorage = new VueLocalStorage();

Vue.use({
	install: function(Vue)
	{
		Vue.mixin({
			created: function()
			{
				var this$1 = this;
	
				if(this.$options.localStorage)
				{
					Object.keys(this.$options.localStorage).forEach(function(key)
					{
						var type = this$1.$options.localStorage[key].type;
						var def  = this$1.$options.localStorage[key].default;
	
						vueLocalStorage.addProperty(key, type, def);
					});
				}
			}
		});

		Vue.localStorage = vueLocalStorage;
		Vue.prototype.$localStorage = vueLocalStorage;
	}
});

