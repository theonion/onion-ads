/*

    Swf Stunt 

    This unit pops up a flash overlay.

    Options: 
    - pixel
    - clickthru
    - clickTagName
    - width
    - height
    - image
    - blocking
    - duration 

*/  
;(function(Ads) {
    "use strict";
    Ads.units.SwfStunt = augment(Ads.units.Swf, function(uber) {
        
        this.constructor = function(loader, $slot, $iframe, options) {
            uber.constructor.call(this, loader, $slot, $iframe, options);
        }

        this.setStyle = function($body) {
            this.$slot.css({
                position: "absolute",
                zIndex:10000000,
                left: "50%",
                marginLeft: -this.options.width/2,
            });
            
            this.resize(this.options.width, this.options.height);
            setTimeout($.proxy(this.destroy, this), this.options.duration * 1000);

            return {};
        }
    });

    Ads.units.SwfStunt.defaults = $.extend({}, Ads.units.Swf.defaults, {
        width: {"type":"number", "default": 800},
        height: {"type":"number", "default": 600},
        duration: {"type":"number", "default": 8},
        blocking: {"type":"boolean", "default": true},
        clickTagName: {"type":"text", "default":"clickTag"}
    });
})(this.Ads);