/*
   
*/  
;(function(Ads) {
    "use strict";
    Ads.units.SwfStunt = augment(Ads.units.Swf, function(uber) {
        this.defaults = $.extend({
            width: 800,
            height: 600,
            delay: 8,
            blocking: true,
            clickTagName: "clickTag"
        }, uber.defaults);
        
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
            setTimeout($.proxy(this.destroy, this), this.options.delay * 1000);
        }
    });

    Ads.units.SwfStunt.defaults = $.extend({}, Ads.units.Swf.defaults, {
        width: 800,
        height: 600,
        delay: 8,
        blocking: true,
        clickTagName: "clickTag"
    });
})(self.Ads);