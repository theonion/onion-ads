/*! onion-ads */

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
    FlashReplace is developed by Robert Nyman, http://www.robertnyman.com. License and downloads: http://code.google.com/p/flashreplace/
*/

var FlashReplace = {
    elmToReplace : null,
    flashIsInstalled : null,
    defaultFlashVersion : 7,
    replace : function (elmToReplace, src, id, width, height, version, params){
        this.elmToReplace = elmToReplace; //document.getElementById(elmToReplace);
        this.flashIsInstalled = this.checkForFlash(version || this.defaultFlashVersion);
        if(this.elmToReplace && this.flashIsInstalled){
            var obj = '<object' + ((window.ActiveXObject)? ' id="' + id + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" data="' + src + '"' : '');
            obj += ' width="' + width + '"';
            obj += ' height="' + height + '"';
            obj += '>';
            var param = '<param';
            param += ' name="movie"';
            param += ' value="' + src + '"';
            param += '>';
            param += '';
            var extraParams = '';
            var extraAttributes = '';
            for(var i in params){
                extraParams += '<param name="' + i + '" value="' + params[i] + '">';
                extraAttributes += ' ' + i + '="' + params[i] + '"';
            }
            var embed = '<embed id="' + id + '" src="' + src + '" type="application/x-shockwave-flash" width="' + width + '" height="' + height + '"';
            var embedEnd = extraAttributes + '></embed>';
            var objEnd = '</object>';
            this.elmToReplace.innerHTML = obj + param + extraParams + embed + embedEnd + objEnd;            
        }
    },
    
    checkForFlash : function (version){
        this.flashIsInstalled = false;
        var flash;
        if(window.ActiveXObject){
            try{
                flash = new ActiveXObject(("ShockwaveFlash.ShockwaveFlash." + version));
                this.flashIsInstalled = true;
            }
            catch(e){
                // Throws an error if the version isn't available           
            }
        }
        else if(navigator.plugins && navigator.mimeTypes.length > 0){
            flash = navigator.plugins["Shockwave Flash"];
            if(flash){
                var flashVersion = navigator.plugins["Shockwave Flash"].description.replace(/.*\s(\d+\.\d+).*/, "$1");
                if(flashVersion >= version){
                    this.flashIsInstalled = true;
                }
            }
        }
        return this.flashIsInstalled;
    }
};;/*

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

        /*  setSelector & setTargeting 

            Use these guys for responsive stuff. You can externally define a resize listener
            that updates the selector used to grab which ads are visible.

        */

        // Change selector used to find slots after Ads has been initiated
        this.setSelector = function(selector) {
            this.options.selector = selector
        }

        // Change targeting after Ads has been initialized. 
        this.setTargeting = function(newTargeting) {
            this.options.targeting = newTargeting;
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
        };

        this.destroy = function() {
            // kill all ad units
            var slots = Object.keys(this.units);
            for (var i = 0; i < slots.length; i++) {
                this.units[slots[i]].destroy()
            }

            //TODO: remove all classnames from body that begin with "ad-"
        }

    })
})(this.Ads);;/* Loads ads from DFP */
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
        this.defaults = {}

        this.constructor = function(loader, $slot, $iframe, options) {
            this.options = $.extend(this.defaults, options);
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
            this.$slot.remove();
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

})(self.Ads);;/*
    Base for loader objects. If used directly, will only display placeholders.

    Defines a common interface for dealing with ads, regardless of where they come from.
*/  
;(function(Ads) {
    "use strict";
    Ads.units.Swf = augment(Ads.units.BaseUnit, function(uber) {
        this.constructor = function(loader, $slot, $iframe, options) {
            uber.constructor.call(this, loader, $slot, $iframe, options);
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
    })
})(this.Ads);/*
   
*/  
;(function(Ads) {
    "use strict";
    Ads.units.SwfStunt = augment(Ads.units.Swf, function(uber) {
        this.defaults = {
            width: 800,
            height: 600,
            delay: 8,
            blocking: true,
            clickTagName: "clickTag"
        }
        this.constructor = function(loader, $slot, $iframe, options) {
            uber.constructor.call(this, loader, $slot, $iframe, options);
        }

        this.setStyle = function($body) {
            this.$slot.css({
                position: "absolute",
                zIndex:10000000,
                left: "50%",
                marginLeft: -this.options.width/2,
            });
            
            this.resize(this.options.width, this.options.height);
            setTimeout($.proxy(this.destroy, this), this.options.delay * 1000);
        }
    })
})(self.Ads);;;/*
   
*/      
;
if (window.DMVAST) {

(function(Ads, vast) {
    "use strict";
    Ads.units.VideoUnit = augment(Ads.units.BaseUnit, function(uber) {
        this.constructor = function(loader, $slot, $iframe, options) {
            uber.constructor.call(this, loader, $slot, $iframe, options);
            this.volume = options.volume || 0;
            this.top_right_icon = options.top_right_icon || "volume-up";
            this.video_tag_selector = this.slotName + "_video";
            this.video_tag = this.createVideoTag(this.slotName);
            this.poster_url = options.poster_url;
            this.video_sound_pixel_tracker = options.video_sound_pixel_tracker;
            this.video_expand_pixel_tracker = options.video_expand_pixel_tracker;

            // this is so dumb
            var behaviors = {"enlarge":0, "soundOn": 0};
            this.behavior = behaviors[options.behavior];
            if (behaviors[options.behavior]) {
                this.behavior = options.behavior;
            }

            var video_unit = this;
            vast.client.get(options.vast_url, function(res) {
                if (res) {
                    video_unit.setupVAST(res);
                    video_unit.data_loaded = true;
                    if (video_unit.built) {
                        video_unit.play(this.volume);
                    }
                }
            });
        };

        this.render = function() {
            uber.render.call(this);
            if (this.data_loaded) {
                this.play(this.volume);
            }
        }

        this.setStyle = function($body) {

        };

        this.setMarkup = function($body) {
            this.video_anchor = $("<a>")
                .attr({
                    "href": '#',
                    "target": "_blank"
                });
            console.log(this.video_tag)
            this.video_anchor.append(this.video_tag);
            $body.append(this.video_anchor);
        };

        this.createVideoTag = function (name) {
            return $('<video>')
                .attr('id', name + '_video')
                .addClass('video-js vjs-default-skin ad-' + name);
        };

        this.play = function() {
            /*
            some notes on video.js and vast
              - in some browsers, you can't reuse the video player instantiated by videojs
                as in functions like enlarge player. to get around this, video play completely
                destroys the video container, creates a new one, and instantiates a new player
              - in some browsers, timeUpdate can satisfy certain timing conditions multiple times.
                (eg safari triggers VAST.play twice. there could be others!)
            to prevent this, timing conditions uses .one which fires events only once
              - blah blah blah
            */
            var video_unit = this;
            if(videojs.players[this.video_tag_selector]) {
                this.player.dispose();
                var videotag = createVideoTag(video_unit.slotName);
                $(this.video_anchor).prepend(videotag);
            }
            var videojs_options = {
                preload: true,
                controls: false,
                width: 'auto',
                height: 'auto'
            };

            var video_element = this.$body.find('#'+this.video_tag_selector)[0];
            videojs(video_element, videojs_options, function() {
                video_unit.player = this;
                video_unit.player.on('canplay', function() {video_unit.vastTracker.load();});
                video_unit.player.on('timeupdate', function() {
                    if (isNaN(video_unit.vastTracker.assetDuration)) {
                        video_unit.vastTracker.assetDuration = video_unit.player.duration();
                    };
                    video_unit.vastTracker.setProgress(video_unit.player.currentTime());
                });
                video_unit.player.on('play', function() {video_unit.vastTracker.setPaused(false);});
                video_unit.player.on('pause', function() {video_unit.vastTracker.setPaused(true);});
                video_unit.startPlayer(this, video_unit.volume);
            });
        };

        this.startPlayer = function(player, volume) {
            try {
                player.controlBar.el().parentNode.removeChild(player.controlBar.el());
                player.loadingSpinner.el().parentNode.removeChild(player.loadingSpinner.el());
            } catch(e) {}

            //add whatever icons, do unit-specific behavior, etc
            if (this.behavior) this[this.behavior]();

            player.prevTime = 0;
            player.src(this.sources);
            player.volume(volume);
            player.play();
        };


        this.enlarge = function() {
            //video player with enlarge button during play, repeat button on end
            this.player.on('ended', $.proxy(this.end, this));
            var container = $("#" + this.video_tag_selector);
            var current_icon = this.current_icon || this.opt.top_right_icon;
            var top_right_icon = $("<i class='fa fa-" + current_icon + "'></i>");
            container.append(top_right_icon);
            container.on('click', 'i.fa-' + this.top_right_icon, $.proxy(this.enlargePlayer, this));
            container.on('click', 'i.fa-compress', $.proxy(this.minimize, this));
            container.on('click', 'i.fa-repeat', $.proxy(this.repeat, this));
        };

        this.enlargePlayer = function() {
            this.current_icon = 'compress';
            $("#" + this.video_tag_selector).find("i")
                .removeClass()
                .addClass('fa fa-compress');
            $(document).keyup(function(e){if (e.which == 27) { 
                $.proxy(this.minimize, this);
            }});
            $("#" + this.video_tag_selector).parent().addClass('enlarged');
            this.play(1);
            this.firePixel(this.video_expand_pixel_tracker);
            return false;
        };

        this.soundOn = function() {
            var container = $("#" + this.video_tag_selector);
            var enlargeicon = $("<i class='fa fa-volume-up'></i>");
            container.append(enlargeicon);
            container.on('click', 'i.fa-volume-up', $.proxy(this.setSoundOn, this));
        };

        this.setSoundOn = function() {
            this.player.currentTime(0);
            this.player.volume(100);
            this.player.play();
            this.firePixel(this.video_sound_pixel_tracker);
            return false;
        };

        this.repeat = function() {
            $("#" + this.video_tag_selector).find("img.poster").remove();
            return this.enlargePlayer();
        };

        this.minimize = function() {
            $("#" + this.video_tag_selector).parent().removeClass('enlarged');
            this.play(0);
            $("#" + this.video_tag_selector).find("i")
                .removeClass()
                .addClass('fa fa-' + this.top_right_icon);
            $(document).off("keyup");
            return false;
        };

        this.destroy = function() {
            this.player.dispose();
            uber.destroy.call(this);
        };

        this.end = function() {
            $("#" + this.video_tag_selector + " img").remove();
            $("#" + this.video_tag_selector).parent().removeClass('enlarged');
            $("#" + this.video_tag_selector).find("i")
                .removeClass()
                .addClass('fa fa-repeat');
            if(this.poster_url){
                var img = $(
                    "<img class='afns-ad-element afns-ad-" +
                    this.slotName +
                    "_poster poster' src='" +
                    this.poster_url +
                    "'>");
                $("#" + this.video_tag_selector).append(img);
            }
        };

        this.setupVAST = function(data) {
            for (var adIdx = 0; adIdx < data.ads.length; adIdx++) {
                var ad = data.ads[adIdx];
                for (var creaIdx = 0; creaIdx < ad.creatives.length; creaIdx++) {
                    var linearCreative = ad.creatives[creaIdx];
                    if (linearCreative.type !== "linear") continue;
                  
                    if (linearCreative.mediaFiles.length) {
                        this.sources = $.map(linearCreative.mediaFiles, function(f) {
                            return {'type': f.mimeType, 'src': f.fileURL};
                        });
                        this.vastTracker = new vast.tracker(ad, linearCreative);

                        var clickthrough;
                        if (this.vastTracker.clickThroughURLTemplate) {
                          clickthrough = vast.util.resolveURLTemplates(
                            [this.vastTracker.clickThroughURLTemplate],
                            {
                                CACHEBUSTER: Math.round(Math.random() * 1.0e+10),
                                CONTENTPLAYHEAD: this.vastTracker.progressFormated()
                            }
                          )[0];              
                        }
                        clickthrough = clickthrough || "#";

                        $(this.video_anchor)
                            .attr("href", clickthrough)
                            .click(function(){
                                var clicktrackers = this.vastTracker.clickTrackingURLTemplate;
                                if (clicktrackers) {
                                    this.vastTracker.trackURLs(clicktrackers);
                                }
                            });

                        break;
                    }
                }
                if (this.vastTracker) {
                    break;
                } else {
                    // Inform ad server we can't find suitable media file for this ad
                    vast.util.track(ad.errorURLTemplates, {ERRORCODE: 403});
                }
            }
        };
    })

})(self.Ads, DMVAST);

}
