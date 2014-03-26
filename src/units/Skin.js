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
            console.log(this.options.gradient);
            if (this.options.gradient) {
                var bodyBackground = window.parent.$("body").css("background-color");
                var sheet = {
                    "a.wallpaper": {
                        "background-position": "top",
                        "background-repeat": "no-repeat",
                        "-webkit-box-shadow": "inset 0px -100px 100px -30px " + bodyBackground ,
                        "-mox-box-shadow":  "inset 0px -100px 100px -30px " + bodyBackground,
                        "box-shadow": "inset 0px -100px 100px -30px " + bodyBackground,
                        "height": "300px",
                        "width": "100%",
                        "position": "absolute",
                        "z-index": "1",
                        "display":"block"
                    }
                }
                var style = this.utils.createStyleSheet(sheet);
                //TOOO: make this part of createStyleSheet
                this.$iframe.contents().find("head").append(style);
            }
        }

        this.setMarkup = function($body) {
            var html = this.utils.template(
                '<a class="wallpaper" target="_blank" href="{{clickthru}}" style="background-image: url({{image}})"></a>', this.options );
            $body.html(html);
        };
    })
    Ads.units.Skin.defaults = $.extend({}, Ads.units.BaseUnit.defaults, {
        image: {"type":"image", "default":""},
        gradient: {"type":"boolean", "default":true},
    });
})(self.Ads);