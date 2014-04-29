/*

    Hide

    Hides an ad slot. 


    Options: 
    (no options)
*/
;(function(Ads) {
    "use strict";
    Ads.units.Hide = augment(Ads.units.BaseUnit, function(uber) {

        this.constructor = function(loader, $slot, $iframe, options) {
            uber.constructor.call(this, loader, $slot, $iframe, options);
        }

        this.setStyle = function($body) {
            this.resize(0, 0);
            this.$iframe.css({display:"none"}};
        }

        this.setMarkup = function($body) {}
    })

})(this.Ads);