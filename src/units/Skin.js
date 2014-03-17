/*
   
*/  
;(function(Ads) {
    "use strict";
    Ads.units.Skin = augment(Ads.units.BaseUnit, function(uber) {
        this.params = {
            

        }


        this.constructor = function(loader, $slot, $iframe, options) {
            uber.constructor.call(this, loader, $slot, $iframe, options);
        }

        this.setStyle = function($body) {
            uber.setStyle.call(this, $body);
            $body.css({
                backgroundColor: "blue",
                textAlign: "center",
                color: "white"
            });
        }

        this.setMarkup = function($body) {
            $body.append("THIS IS A SKIN");
        };


    })

})(self.Ads);