/*! onion-ads 2014-03-17 */
(function (global, factory) {
    if (typeof define === "function" && define.amd) define(factory);
    else if (typeof module === "object") module.exports = factory();
    else global.augment = factory();
}(this, function () {
    "use strict";

    var Factory = function () {};
    var slice = Array.prototype.slice;

    return function (base, body) {
        var uber = Factory.prototype = typeof base === "function" ? base.prototype : base;
        var prototype = new Factory;
        body.apply(prototype, slice.call(arguments, 2).concat(uber));
        if (!prototype.hasOwnProperty("constructor")) return prototype;
        var constructor = prototype.constructor;
        constructor.prototype = prototype;
        return constructor;
    }
}));;/*

    Ads is responsible for 
    - handling external configuration
    - selecting the appropriate loader
    - defines the ads interface for external use, e.g. 

*/

;(function(global) {
    "use strict";
    var Ads = Ads || function(options) {
        options.targeting = options.targeting || {};

        // initialize 
        this.init = function() {
            
            /* logic to choose loader goes here. */

            var loaderType = "DfpLoader";

            //Adbuilder link
            var adHash = this.getParamByName("ad");

            // check for "ad" param in querystirng, choose "JsonLoader"        
            if (this.getParamByName("showslots")) {
                loaderType = "BaseLoader";
            }
            else if (adHash !== "") {
                options.url = "http://adops.onion.com/adbuilder/serve/?ad=" + adHash;
                loaderType = "JsonLoader";
            }
            else if (typeof options.data !== "undefined") {
                loaderType = "JsonLoader";
            }

            this.loader = new Ads[loaderType](options);
            this.loader.load();
        }

        this.addTargeting = function(name, value) {
            targeting[name] = value;
        }

        this.refresh = function() {
            loader.refresh(targeting);
        }

        this.destroy = function() {
            loader.destroy();
        }

        this.getParamByName = function(name){
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(window.location.search);
            if(results === null) {
                return "";
            }
            else {
                return decodeURIComponent(results[1].replace(/\+/g, " "));
            }
        }
        
        this.init();
    }
    global.Ads = Ads;
    global.Ads.units = {};
})(this);;/*
    Base for loader objects. If used directly, will only display placeholders.

    Defines a common interface for dealing with ads, regardless of where they come from.
*/  
;(function(Ads) {
    "use strict";
    Ads.BaseLoader = augment(Object, function() {
        this.constructor = function(options) {
            this.options = options;
            this.slots = this.getSlots();
            this.units = {};
        }

        this.getSlots = function() {
            //TODO: make sure there aren't any duplicate slots
            return $(this.options.selector);
        }

        this.insertIframe = function(element, contents) {
            var iframe = document.createElement("iframe");

            contents = "<!DOCTYPE html><html><head><meta charset=\"utf-8\">\
                            <style>*{margin:0px; padding:0px; overflow: hidden;}</style>\
                            </head><body>" + contents + "</body></html>".trim();

            if (!!("srcdoc" in document.createElement("iframe"))) { //check if srcdoc is implemented
                $(iframe).attr("srcdoc", contents);
            }
            else {
                $(iframe).attr("src", "javascript: '" + contents.replace(/'/g, "\\'" ) + "'");
            }

            $(iframe)
                .attr("marginwidth", 0)
                .attr("marginheight", 0)
                .attr("hspace", 0)
                .attr("vspace", 0)
                .attr("frameBorder", 0)
                .attr("border", 0)
                .attr("scrolling", "no")
            element.appendChild(iframe);
        }

        /*  Load is normally the method used to fetch ads from a server.
            In the case of the DefaultLoader, it just inserts iframes with the base unit.  */
        this.load = function(targeting) {
            console.log("Default Loader: loading");
            for (var i=0; i < this.slots.length; i++) {
                this.insertIframe(this.slots[i], "<div data-type=\"BaseUnit\"></div>");
            }
            setTimeout($.proxy(this.initializeUnits, this), 100);
        }

        /*  Goes through the iframes and kicks off units */

        this.initializeUnits = function() {
            var blocker = false;
            for (var i=0; i < this.slots.length; i++) {
                //look for an ad unit inside of the iframe
                var iframe = $("iframe", this.slots[i]),
                    slot = $(this.slots[i]),
                    unitOptions = iframe.contents().find("[data-type]").data(),
                    slotname = slot.attr("data-slotname");


                if (typeof unitOptions === "undefined") {
                    // No ad unit for this slot
                }
                else if (typeof Ads.units[unitOptions.type] === "undefined") {
                    console.warn("Warning: " + unitOptions.type + " isn't defined.");
                }
                else {
                    $("body").addClass("ad-" + slotname + "-" + unitOptions.type.toLowerCase() );

                    this.units[slotname] = new Ads.units[unitOptions.type](this, slot, iframe, unitOptions);
                    //maybe throw a warning if there is more than one blocker. Not really a thing that should be allowed.
                    if (unitOptions.blocking) { 
                        // got a blocker? build now. 
                        this.units[slotname].build()
                        blocker = true;
                    } 
                }
                //TODO: afns-ad-element shit
            }

            // no blockers? go ahead and run. Otherwise, run is triggered upon destruction of the blocking ad.
            if (!blocker) {
                this.run();
            }
        }

        this.run = function() {            
            // build all ad units at current runlevel, then decrement
            var slots = Object.keys(this.units);
            for (var i = 0; i < slots.length; i++) {
                this.units[slots[i]].build()
            }
        };

    })
})(this.Ads);;/* Loads ads from DFP */
;(function(Ads) {
    "use strict";
    Ads.DfpLoader = augment(Ads.BaseLoader, function(uber) {
        this.constructor = function(options) {
            console.log("DFP constructor");
            uber.constructor.call(this, options);
        }
    });
})(this.Ads);/*  JsonLoader is pretty chill, by design. 

    In addition to the options available in the BaseLoader,
    JsonLoader adds a few more:

    - url: remote url to fetch data from. 
    - data: either a JSON string or an object


*/
;(function(Ads) {
    "use strict";
    Ads.JsonLoader = augment(Ads.BaseLoader, function(uber) {
        this.constructor = function(options) {
            uber.constructor.call(this, options);
        }
        this.load = function() {
            if (this.options.url) {
                //TODO: load via JSONP
            }
            else if  (typeof this.options.data === "object") {
                this.data = this.options.data;
            }  
            else if  (typeof this.options.data === "string") {
                this.data = $.parseJSON(this.options.data);
            }
            else {
                console.warn("JsonLoader needs one of the two params: data or url.");
            }
            if (this.data) {
                this.onDataReady();
            }
        }

        this.onDataReady = function() {
            for (var i=0; i < this.slots.length; i++) {
                var slotname = $(this.slots[i]).data("slotname");
                this.insertIframe(this.slots[i], this.options.data[slotname]);
            }
            setTimeout($.proxy(this.initializeUnits, this), 100);
        }
    });
})(this.Ads);/*
    Base Ad Unit
*/  
;(function(Ads) {
    "use strict";
    Ads.units.BaseUnit = augment(Object, function() {

        this.constructor = function(loader, $slot, $iframe, options) {
            this.options = options;
            this.loader = loader;
            this.$iframe = $iframe;
            this.$body = $("body", $iframe.contents()),
            this.$slot = $slot,
            this.slotName = $slot.attr("data-slotname"),
            this.built = false;
            this.resize($slot.data("width"), $slot.data("height"));
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
            $iframe.remove();
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
})(self.Ads);;/*
    Base for loader objects. If used directly, will only display placeholders.

    Defines a common interface for dealing with ads, regardless of where they come from.
*/  
;(function(Ads) {
    "use strict";
    Ads.units.Swf = augment(Ads.units.BaseUnit, function(uber) {

        this.constructor = function(loader, slot, iframe, options) {
            uber.constructor(loader, slot, iframe, options);
        }

        //options are DFP params
        this.render = function() {

        }

        this.destroy = function() {

        }
    })
})(this.Ads);/*
   
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
})(self.Ads);;;;/*
   
*/      
;(function(Ads) {
    "use strict";
    Ads.units.Skin = augment(Ads.units.BaseUnit, function(uber) {
        this.constructor = function(loader, $slot, $iframe, options) {
            uber.constructor.call(this, loader, $slot, $iframe, options);
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