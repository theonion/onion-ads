/*
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
            this.refreshCount = 0;

            //initialize events to watch for idle. 
            var self = this;
            $(window.top).bind("mousemove touchmove focus", function() {
                self.refreshCount = 0;
            });
            if (this.options.onLoad) {
                this.options.onLoad()
            }
        }

        this.getSlots = function() {
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
                    if (this.units[slotname].options.blocking) { 
                        // got a blocker? build now. Pass in a callBack for on destroy
                        this.units[slotname].build();
                        blocker = true;
                        // alias the destroy function for this unit, so it is easy to call from Flash. 
                        window.closeAd = $.proxy(this.units[slotname].destroy, this.units[slotname]);
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

            if (this.options.refreshInterval > 0) {
                clearTimeout(this.refreshTimeout);
                this.refreshTimeout = setTimeout($.proxy(this.refresh, this), this.options.refreshInterval * 60 * 1000);
            }
        };


        this.refresh = function() {
            this.refreshCount++;
            if (this.refreshCount <= this.options.refreshLimit) {
                this.destroyUnits();
                this.load();
                if (this.options.onRefresh) {
                    this.options.onRefresh(this.refreshCount)
                }
            }
            else {
                clearTimeout(this.refreshTimeout);
                this.refreshTimeout = setTimeout($.proxy(this.refresh, this), this.options.refreshInterval * 60 * 1000);
            }
        }

        this.destroyUnits = function() {
            // kill all ad units
            var slots = Object.keys(this.units);
            for (var i = 0; i < slots.length; i++) {
                this.units[slots[i]].destroy()
            }
            // blow out all the slot contents
            $(this.options.selector).children().remove();

            //remove all classnames from body that begin with "ad-"
            document.body.className = document.body.className.replace(/ad-\S+/g, "").trim();
            this.units = {};
        }

        this.destroy = function() {
            this.destroyUnits();
        }
    })
})(this.Ads);