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
            this.$head = $("head", $iframe.contents()),
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
            return { 
                "body": {
                    "background-color": "#AE81FF",
                    "font-family": "sans-serif",
                    "font-size": "12px",
                    "padding": "5px"
                    }
                }
        }

        this.setMarkup = function($body) {
            $body.append(
                "<center><b>" + this.slotName + "</b><br>" + this.$slot.data("width") + "x" +  this.$slot.data("height") + "</center>"
            );
        }

        this.render = function() {
            this.utils.addStyles(this.setStyle(this.$body), this.$iframe);
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
            addStyles: function(styles, frame) {
                if (!frame) {
                    frame = window;
                }
                var styleNode = document.createElement("style");
                styleNode.type = "text/css";

                var css = "";
                for (var selector in styles) {
                    var temp = "" + selector + '{';
                    for (var rule in styles[selector]) {
                        temp += rule + ':' + styles[selector][rule] + ';';
                    }
                    temp += '}';
                    css += temp;
                }
                if (styleNode.styleSheet) {
                    styleNode.styleSheet.cssText = css;
                } else {
                    styleNode.appendChild(document.createTextNode(css));
                }
                frame.contents().find("head").append(styleNode);
            }
        }
    });

    Ads.units.BaseUnit.defaults = {
        pixel: {"type":"pixel", "default":""},
        clickthru: {"type":"url", "default": ""}
    };
})(this.Ads);