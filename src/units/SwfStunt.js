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
        this.defaults = {
            width: 800,
            height: 600,
            duration: 8,
            blocking: true,
            clickTagName: "clickTag"
        }
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
        }
    })
})(self.Ads);