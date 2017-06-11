(function (){ 'use strict';

var MINUTE = 60;
var HOUR = MINUTE * 60;
var DAY = HOUR * 24;
var WEEK = DAY * 7;
var MONTH = DAY * 30;
var YEAR = DAY * 365;

function pluralOrSingular(data, locale)
{
  if(data === 'just now') return locale;

  var count = Math.round(data);

  if(Array.isArray(locale)) {
    return count > 1
      ? locale[1].replace(/%s/, count)
      : locale[0].replace(/%s/, count)
  }
  return locale.replace(/%s/, count)
}

function formatTime(time){ var d = new Date(time); return d.toLocaleString() }

var locales =
{
	'en-US':
	[
		"just now",
		["%s second ago", "%s seconds ago"],
		["%s minute ago", "%s minutes ago"],
		["%s hour ago", "%s hours ago"],
		["%s day ago", "%s days ago"],
		["%s week ago", "%s weeks ago"],
		["%s month ago", "%s months ago"],
		["%s year ago", "%s years ago"]
	]
};

Vue.component('timeago',
{
	props:
	{
		since:{ required: true }, locale: String, maxTime: Number, autoUpdate: Number, format: Function
	},

	data: function data(){ return { now: new Date().getTime() } },

    computed:
    {
      currentLocale: function currentLocale()
      {
        var current = locales[this.locale || 'en-US'];

        if(!current) return locales['en-US'];

        return current
      },

      sinceTime: function sinceTime(){ return new Date(this.since).getTime() },

      timeago: function timeago()
      {
        var seconds = (this.now / 1000) - (this.sinceTime / 1000);

        if(this.maxTime && seconds > this.maxTime)
        {
          clearInterval(this.interval); return this.format ? this.format(this.sinceTime) : formatTime(this.sinceTime);
        }

        var ret
          = seconds <= 5
          ? pluralOrSingular('just now', this.currentLocale[0])
          : seconds < MINUTE
          ? pluralOrSingular(seconds, this.currentLocale[1])
          : seconds < HOUR
          ? pluralOrSingular(seconds / MINUTE, this.currentLocale[2])
          : seconds < DAY
          ? pluralOrSingular(seconds / HOUR, this.currentLocale[3])
          : seconds < WEEK
          ? pluralOrSingular(seconds / DAY, this.currentLocale[4])
          : seconds < MONTH
          ? pluralOrSingular(seconds / WEEK, this.currentLocale[5])
          : seconds < YEAR
          ? pluralOrSingular(seconds / MONTH, this.currentLocale[6])
          : pluralOrSingular(seconds / YEAR, this.currentLocale[7]);

        return ret
      }
    },
    mounted: function(){ if(this.autoUpdate) this.update(); },

    render: function(h){ return h('time', { attrs: { datetime: new Date(this.since) } }, this.timeago); },

    watch:
    {
      autoUpdate: function(newAutoUpdate)
      {
        this.stopUpdate();
        // only update when it's not falsy value
        // which means you can set it to 0 to disable auto-update
        if(newAutoUpdate) this.update();
      }
    },

    methods:
    {
      update: function()
      {
        var this$1 = this;

        var period = this.autoUpdate * 1000;

        this.interval = setInterval(function(){ this$1.now = new Date().getTime(); }, period);
      },
      stopUpdate: function(){ clearInterval(this.interval); this.interval = null; }
    },

    beforeDestroy: function(){ this.stopUpdate(); }
});

})();
