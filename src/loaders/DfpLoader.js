/* Loads ads from DFP */
;(function(Ads) {
    "use strict";
    Ads.DfpLoader = augment(Ads.BaseLoader, function(uber) {
        this.constructor = function(options) {
            uber.constructor.call(this, options);
            this.activeAds = {}
        }

        this.refresh = function() {
            /* var web_ads = [];
            self.ad_units.demolish();
            $(self.visible_ads).each(function(i){
                var slot_name = this.id.replace("dfp-ad-", "");
                web_ads.push(self.active_list[slot_name]);
            });
            googletag.pubads().refresh(web_ads);
            */
        }
        
        this.load = function() {
            window.googletag = window.googletag || {};
            googletag.cmd = googletag.cmd || [];
            var self = this;
            (function() {
                var gads = document.createElement("script");
                gads.async = true;
                gads.type = "text/javascript";
                gads.id = "dfp_script";
                var useSSL = "https:" == document.location.protocol;
                gads.src = "http://www.googletagservices.com/tag/js/gpt.js";
                var node = document.getElementsByTagName("script")[0];
                node.parentNode.insertBefore(gads, node);
            })();
            googletag.cmd.push($.proxy(this.dfpReady, this));
        }


        this.dfpReady = function() {
            var targeting = this.options.targeting;
            for (var t in targeting) {
                if (targeting[t]) googletag.pubads().setTargeting(t, targeting[t].toString());
            }
            var self = this;

            self.slotsToRender = self.slots.length;

            // we need to wait for all slots to finish before calling initalizeSlots. 
            // There is no "global" ready, need to do it this way.
            googletag.pubads().addEventListener('slotRenderEnded', function(event) {
                self.slotsToRender--;
                if (self.slotsToRender === 0) {
                    setTimeout($.proxy(self.initializeUnits, self), 50);
                }
            });

            $(this.slots).each(function(){
                var s = this;
                var slotName = $(s).data("slotname"),
                    h = $(s).data('height'),
                    w = $(s).data('width');
                var ad = googletag.defineSlot('/' + self.options.dfpNetworkCode + '/' + slotName, [w, h], s.id).addService(googletag.pubads());
                self.activeAds[slotName] = ad;
            });

            googletag.pubads().collapseEmptyDivs();
            googletag.pubads().enableSingleRequest();
            googletag.enableServices();
            
            // display ads
            $(this.slots).each(function(){
                googletag.display(this.id);
            });
        }

        this.destroy = function() {
            //gross, but it works. Prevents weird JS errors between reloads when changing the ad slots
            var dfp_junk = ["googletag", "GPT_jstiming",  "Goog_AdSense_getAdAdapterInstance",
            "Goog_AdSense_OsdAdapter", "google_noFetch", "google_DisableInitialLoad", "_GA_googleCookieHelper",
            "__google_ad_urls", "google_unique_id", "google_exp_persistent", "google_num_sdo_slots",
            "google_num_0ad_slots", "google_num_ad_slots", "google_correlator", "google_prev_ad_formats_by_region",
            "google_prev_ad_slotnames_by_region", "google_num_slots_by_channel", "google_viewed_host_channels",
            "google_num_slot_to_show", "gaGlobal", "google_persistent_state", "google_onload_fired"];

            uber.destroy.call(this, options);

            $("#dfp_script").remove();
            for (var i=0;i<dfp_junk.length;i++) delete window[dfp_junk[i]];
        }

    });
})(this.Ads)