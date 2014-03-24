/*
    Standard skin


    Options: 
    - pixel
    - clickthru
    - image
*/      
;(function(Ads) {
    "use strict";
    Ads.units.Skin = augment(Ads.units.BaseUnit, function(uber) {
        this.constructor = function(loader, $slot, $iframe, options) {
            uber.constructor.call(this, loader, $slot, $iframe, options);
            if (this.options.runImmediately) {
                this.render();
            }
        }

        this.setStyle = function($body) {
            this.resize(1460, 300);
        }

        this.setMarkup = function($body) {
            var html = this.utils.template(
                '<a target="_blank" href="{{clickthru}}">\
                    <img src="{{image}}">\
                </a>', this.options );
            $body.html(html);
        };
    })

})(self.Ads);