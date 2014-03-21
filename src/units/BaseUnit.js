/*
    Base Ad Unit
*/  
;(function(Ads) {
    "use strict";
    Ads.units.BaseUnit = augment(Object, function() {
        this.defaults = {
            pixel: "",
        }

        this.constructor = function(loader, $slot, $iframe, options) {
            this.options = $.extend(this.defaults, options);
            this.loader = loader;
            this.$iframe = $iframe;
            this.$body = $("body", $iframe.contents()),
            this.$slot = $slot,
            this.slotName = $slot.attr("data-slotname"),
            this.built = false;
            this.resize($slot.data("width"), $slot.data("height"));
            this.originalSize = {width: $slot.data("width"), height: $slot.data("height")}
        }

        this.resize = function(w, h) {
            this.$iframe.width(w);
            this.$iframe.height(h);
            this.$slot.width(w);
            this.$slot.height(h);
        }

        // Build is called by the loader to render the ad. Build is aware of blocking stuff.
        this.build = function() {
            if (!this.built) {
                this.render();
                this.built = true;
                //fire a pixel
                this.firePixel(this.options.pixel); //TODO: allow multiple values?
            }
        }

        this.setStyle = function($body) {
            if (this.$slot.width() < 100 || this.$slot.height() < 40) {
                this.resize(300, 50);
            }
            $body.css({
                backgroundColor: "#AE81FF",
                fontFamily: "sans-serif",
                fontSize: "12px",
                padding: "5px"
            });
        }

        this.setMarkup = function($body) {
            $body.append(
                "<center><b>" + this.slotName + "</b><br>" + this.$slot.data("width") + "x" +  this.$slot.data("height") + "</center>"
            );
        }

        this.render = function() {
            this.setStyle(this.$body);
            this.setMarkup(this.$body);
        }

        this.destroy = function() {
            //any time and unit is destroyed, call the loader's run to get the next runlevel
            $(this.$slot)
                .attr({"style": ""})
                .children().remove();

            $(this.$slot)
                 .css(this.originalSize);

            this.loader.run();
        }

        this.firePixel = function (url) {
            if (url && window) {
                var i = new Image();
                i.src = (url);
            }
        }

        this.utils = {
            template: function(html, dict) {    
                for (var k in dict) {
                    if (k) {
                        html = html.replace(new RegExp("{{" + k + "}}", 'g'), dict[k]);
                    }
                }
                return html;
            }
        }
    })
})(self.Ads);