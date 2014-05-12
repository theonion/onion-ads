;(function(Ads) {
    "use strict";
    Ads.units.VideoPlaylist = augment(Ads.units.BaseVideoUnit, function(uber) {

        this.constructor = function(loader, $slot, $iframe, options) {
            uber.constructor.call(this, loader, $slot, $iframe, options);
        }
        this.setStyle = function($body) {
            return {};
        }

        this.setMarkup = function($body) {
            uber.setMarkup.call(this, $body);
        };
    })

    Ads.units.VideoSkin.defaults = $.extend({}, Ads.units.BaseVideoUnit.defaults, {
        logo: {"type": "image", "default": ""},        
    });

})(this.Ads);