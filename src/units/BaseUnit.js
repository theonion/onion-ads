/*
    Base Ad Unit
*/  
;(function(Ads) {
    "use strict";
    Ads.units.BaseUnit = augment(Object, function() {
        this.constructor = function(loader, $slot, $iframe, options) {
            this.options = $.extend({}, this.getDefaults(), options);
            this.loader = loader;
            this.$iframe = $iframe;
            this.$body = $("body", $iframe.contents()),
            this.$slot = $slot,
            this.slotName = $slot.attr("data-slotname"),
            this.built = false;
            this.resize($slot.data("width"), $slot.data("height"));
            this.originalSize = {width: $slot.data("width"), height: $slot.data("height")}
        }

        this.getDefaults = function() {
            var defaults = {};
            for (var k in this.constructor.defaults) {
                if (k) {
                    defaults[k] = this.constructor.defaults[k]["default"];
                }
            }
            return defaults;
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
            },
            createStyleSheet: function(sheet) {
                var style = document.createElement("style");
                style.type = "text/css";

                var css = "";
                for (var selector in sheet) {
                    var temp = "" + selector + '{';
                    for (var rule in sheet[selector]) {
                        temp += rule + ':' + sheet[selector][rule] + ';';
                    }
                    temp += '}';
                    css += temp;
                }
                if (style.styleSheet) {
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(css));
                }
                return style;
            }
        }
    });

    Ads.units.BaseUnit.defaults = {
        pixel: {"type":"pixel", "default":""},
        clickthru: {"type":"url", "default": ""}
    };
})(this.Ads);