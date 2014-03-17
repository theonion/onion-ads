/*
    Base for loader objects. If used directly, will only display placeholders.

    Defines a common interface for dealing with ads, regardless of where they come from.
*/  
;(function(Ads) {
    "use strict";
    Ads.units.Swf = augment(Ads.units.BaseUnit, function(uber) {

        this.constructor = function(loader, slot, iframe, options) {
            uber.constructor(loader, slot, iframe, options);
        }

        //options are DFP params
        this.render = function() {

        }

        this.destroy = function() {

        }
    })
})(this.Ads)