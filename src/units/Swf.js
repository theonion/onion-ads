/*
    
    SWF Unit

    Displays an SWF with an image fallback if Flash isn't available. 

    Options: 
    - pixel
    - clickthru
    - clickTagName
    - width
    - height
    - image
*/  
;(function(Ads) {
    "use strict";
    Ads.units.Swf = augment(Ads.units.BaseUnit, function(uber) {
        this.defaults = {
            clickTagName : "clickTag",
            width: 300,
            height: 250,
            clickthru: "#",
            image:""
        }
        this.constructor = function(loader, $slot, $iframe, options) {
            uber.constructor.call(this, loader, $slot, $iframe, options);
            this.options = $.extend(this.options, this.defaults);
            //drop in placeholder
            var element = $("div", this.$body)[0];
            $("<img src='" + this.options.image + "'>").appendTo(element);
        }

        this.setMarkup = function($body) {
            var element = $("div", $body)[0];
            if (FlashReplace.checkForFlash(7)) {
                FlashReplace.replace(element,
                    this.options.swf + "?" + this.options.clickTagName + "=" +    escape(this.options.clickthru), "",
                    this.options.width,
                    this.options.height,
                    7,
                    {
                    wmode : "transparent",
                    quality: "high",
                    allowScriptAccess: "always"
                });
            }
            else {
                $(element).append('<img src="' + this.options.staticImage + '"/>');
            }
        };

        this.setStyle = function() {}
    })
})(this.Ads)