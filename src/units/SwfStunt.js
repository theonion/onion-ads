/*
   
*/  
;(function(Ads) {
    "use strict";
    Ads.units.SwfStunt = augment(Ads.units.BaseUnit, function(uber) {

        this.constructor = function(loader, $slot, $iframe, options) {
            uber.constructor.call(this, loader, $slot, $iframe, options);
        }

        this.setStyle = function($body) {
            uber.setStyle.call(this, $body);
            $body.css({
                backgroundColor: "red",
                textAlign: "center"
            });
        }

        this.setMarkup = function($body) {
            uber.setMarkup.call(this, $body);
            $body.append("THIS IS A SWF STUNT");
        };

    })
})(self.Ads);