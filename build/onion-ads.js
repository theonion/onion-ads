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

;(function(global, videojs, vast) {
    "use strict";
    var Ads = Ads || function(options) {
        this.options = options;
        // initialize 
        this.init = function(options) {
            
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


        //reload is pretty aggressive... tears the loader down and builds it back up.
        this.reload = function(options) {   
            this.loader.destroy();
            if (typeof options !== "undefined") {
                this.options = $.extend(this.options, options);
            }
            this.init(this.options);
        }

        // refresh just reloads the contents of the slots.
        this.refresh = function() {
            this.loader.refresh();
        }

        this.destroy = function() {
            this.loader.destroy();
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
        
        this.init(options);
    }
    Ads.videojs = videojs;
    Ads.vast = vast;
    Ads.units = {};
    global.Ads = Ads;
})(this, this.videojs, this.DMVAST);;/*
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
})(this.Ads);;/* Loads ads from DFP */
;(function(Ads) {
    "use strict";
    Ads.DfpLoader = augment(Ads.BaseLoader, function(uber) {

        this.constructor = function(options) {
            uber.constructor.call(this, options);
            this.activeAds = {}; //DFP ad objects...
        }

        this.refresh = function() {
            this.destroyUnits(); //remove any customizations from custom units...
            var ads = [];
            $(self.activeAds).each(function(i){
                ads.push(self.activeAds[this.data("slotname")]);
            });
            googletag.pubads().refresh(web_ads);
        }
        
        this.load = function() {
            window.googletag = window.googletag || {};
            googletag.cmd = googletag.cmd || [];
            var self = this;
            (function() {
                var gads = document.createElement("script");
                gads.async = true;
                gads.id = "dfp_script";
                gads.src = "//www.googletagservices.com/tag/js/gpt.js";
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

            uber.destroy.call(this);

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
                var self = this;
                $.ajax({
                    url: this.options.url,
                    dataType: 'jsonp',
                    success: function(data) {
                        self.data = $.parseJSON(data);
                        self.onDataReady();
                    }
                });
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
                for (var j=0; j < this.data.length; j++) {
                    if (this.data[j].slotname === slotname) {
                        this.insertIframe(this.slots[i], this.data[j].value);
                        break;
                    }
                }
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
})(this.Ads);;/*

VideoUnit

Base for all video ad units. On its own, displays 

Options: 
- pixel
- clickthru
- vast_url
- poster_url
*/      
;(function(Ads) {
    "use strict";
    Ads.units.BaseVideoUnit = augment(Ads.units.BaseUnit, function(uber) {

        this.constructor = function(loader, $slot, $iframe, options) {
            uber.constructor.call(this, loader, $slot, $iframe, options);
            
            if (!Ads.vast || !Ads.videojs) {
                console.warn("Missing DMVAST or VideoJS");
                return; 
            }

            var self = this;
            if (this.options.vast_url) {
                Ads.vast.client.get(this.options.vast_url, function(res) {
                    if (res) {
                        self.parseVastResponse(res);
                        self.data_loaded = true;
                        if (self.built) {
                            self.play(0);
                        }
                    }
                });
            }
        };

        this.render = function() {
            uber.render.call(this);
            if (this.data_loaded) {
                this.play(0);
            }
        }

        this.setStyle = function($body) {
            var styles = {

                ".vjs-controls-disabled .vjs-control-bar": { 
                    "display":"none" 
                },
                ".video-ad": {
                    "position":"relative",
                    "width": "300px",
                    "height": "250px"
                },
                ".vjs-tech": { "width": "100%" 
                },
                ".video-clickthru, .video-js, .vjs-poster": {
                    "width": "100%",
                    "height": "100%",
                    "position":"absolute",
                    "display":"block",
                    "top": "0px"
                },
                ".video-js": {
                    "z-index": "1"
                },
                ".video-clickthru": {
                    "z-index":"2"
                },
                ".video-sound": {
                    "z-index": "3",
                    "display": "block",
                    "position": "absolute",
                    "width": "20px",
                    "height": "20px",
                    "padding": "10px",
                    "top": "0px",
                    "right": "0px",
                    "cursor": "pointer"
                },
                ".vjs-paused .vjs-poster": {
                    "z-index":"2",
                    "display":"block !important",
                    "background-position": "center",
                    "background-size":"cover"
                },
                ".video-sound i": {
                    "color": "#eeeeee",
                    "text-align":"center",
                    "font-size":"20px",

                },
                ".video-sound i:hover": {
                    "color": "#ffffff"
                },
                ".video-sound i.fa-volume-off": {
                    "display":"block"
                },

                ".video-sound i.fa-volume-up": {
                    "display": "none"
                },

                ".unmuted + .video-sound i.fa-volume-off": {
                    "display": "none"
                },

                ".unmuted + .video-sound i.fa-volume-up": {
                    "display": "block"
                },
                ".done + .video-sound i.fa-volume-up, .done + .video-sound i.fa-volume-off": {
                    "display": "none"
                },
                ".video-sound i.fa-repeat" : {
                    "display":"none"
                },
                ".done + .video-sound i.fa-repeat": {
                    "display": "block"
                },


            }
            return styles;
        };

        this.destroy = function() {
            this.player.dispose();
            uber.destroy.call(this);
        }

        this.setMarkup = function($body) {
            $(".video-ad", $body).html("");
            $body.append('<div class="video-ad"></div>');
            $(".video-ad", $body)
                .append('<video id="video-ad' + this.slotName + '" class="video-js vjs-default-skin"></video>')
                .append('<a class="video-sound"><i class="fa fa-repeat"></i><i class="fa fa-volume-off"></i><i class="fa fa-volume-up"></i></a>')
                .append('<a class="video-clickthru" target="_blank"></a>');
                
            // find the video tag
            this.$video = $("video", $body)[0];
            this.$head.append(
                "<link href='http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css' rel='stylesheet'></link>"
            )
            // register click event on play w/ sound button
            $(".video-sound", $body).click($.proxy(this.soundButtonClicked, this));

        };


        /* Video stuff */

        this.play = function(volume) {
            /*
            some notes on video.js and vast
              - in some browsers, you can't reuse the video player instantiated by videojs
                as in functions like enlarge player. to get around this, video play completely
                destroys the video container, creates a new one, and instantiates a new player
              - in some browsers, timeUpdate can satisfy certain timing conditions multiple times.
                (eg safari triggers VAST.play twice. there could be others!)
            to prevent this, timing conditions uses .one which fires events only once
            */
            var self = this;


            if(Ads.videojs.players["video-ad" + this.slotName]) {
                this.player.dispose();
                self.setMarkup(this.$body);
            }

            var options = {
                preload: true,
                controls: true,
                width: 'auto',
                height: 'auto',
                plugins: { controls: false },
                poster: this.options.poster,
                muted: true
            };

            
            // Initialize Player here. 
            Ads.videojs(self.$video, options, function() {
                self.player = this;
                /* Set up VAST events */
                self.player.on('canplay', function() {self.vastTracker.load();});
                
                self.player.on('timeupdate', function() {
                    if (isNaN(self.vastTracker.assetDuration)) {
                        self.vastTracker.assetDuration = self.player.duration();
                    };
                    self.vastTracker.setProgress(self.player.currentTime());
                });

                self.player.on('play', function() {self.vastTracker.setPaused(false);});

                self.player.on('pause', function() {self.vastTracker.setPaused(true);});

                self.player.on('ended', $.proxy(self.onEnd, self));



                self.player.prevTime = 0;
                self.player.src(self.sources);
                self.player.volume(volume);
                if (volume > 0) {
                    console.log(volume);
                    $(".video-js", self.$body).addClass("unmuted");
                }
                self.player.play();
            });
        };

        this.soundButtonClicked = function() {
            if (!$(".video-js", this.$body).hasClass("unmuted")) {
                this.play(80);
            }
            else {
                //$(".video-js", this.$body).removeClass("unmuted");
                this.player.volume(0);
                $(".video-js", this.$body).removeClass("unmuted")
            }
        }

        this.onEnd = function() {
            // video done
            $(".video-js", this.$body).addClass("done");
        }

        this.parseVastResponse = function(data) {

            for (var adIdx = 0; adIdx < data.ads.length; adIdx++) {
                var ad = data.ads[adIdx];
                for (var creaIdx = 0; creaIdx < ad.creatives.length; creaIdx++) {
                    var linearCreative = ad.creatives[creaIdx];
                    if (linearCreative.type !== "linear") continue;
                  
                    if (linearCreative.mediaFiles.length) {
                        this.sources = $.map(linearCreative.mediaFiles, function(f) {
                            return {'type': f.mimeType, 'src': f.fileURL};
                        });
                        this.vastTracker = new Ads.vast.tracker(ad, linearCreative);

                        var clickthrough;
                        if (this.vastTracker.clickThroughURLTemplate) {
                            clickthrough = Ads.vast.util.resolveURLTemplates(
                            [this.vastTracker.clickThroughURLTemplate],
                            {
                                CACHEBUSTER: Math.round(Math.random() * 1.0e+10),
                                CONTENTPLAYHEAD: this.vastTracker.progressFormated()
                            }
                          )[0];
                        }
                        clickthrough = clickthrough || "#";
                        $('.video-clickthru', this.$body)
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
                    Ads.vast.util.track(ad.errorURLTemplates, {ERRORCODE: 403});
                }
            }
        };
    });

    Ads.units.BaseVideoUnit.defaults = $.extend({}, Ads.units.BaseUnit.defaults, {
        vast_url: {"type": "url", "default":""},
        poster: {"type": "image", "default":""}
    });

})(this.Ads);;/*
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
            this.resize("100%", 300);
            var styles = {};
            if (this.options.gradient) {
                var bodyBackground = window.parent.$("body").css("background-color");
                styles = {
                    "a.wallpaper": {
                        "background-position": "top center",
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
                
            }
            return styles;
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
})(this.Ads);;/*
    
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

        
        this.constructor = function(loader, $slot, $iframe, options) {
            uber.constructor.call(this, loader, $slot, $iframe, options);
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
    });

    Ads.units.Swf.defaults = $.extend({}, Ads.units.BaseUnit.defaults, {
        clickTagName: {"type": "text", "default":"clickTag"},
        width: {"type": "number", "default": 300},
        height: {"type": "number", "default": 250},
        image: {"type": "image", "default": ""}
    });

})(this.Ads);/*

    Swf Stunt 

    This unit pops up a flash overlay.

    Options: 
    - pixel
    - clickthru
    - clickTagName
    - width
    - height
    - image
    - blocking
    - duration 

*/  
;(function(Ads) {
    "use strict";
    Ads.units.SwfStunt = augment(Ads.units.Swf, function(uber) {
        
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
            setTimeout($.proxy(this.destroy, this), this.options.duration * 1000);

            return {};
        }
    });

    Ads.units.SwfStunt.defaults = $.extend({}, Ads.units.Swf.defaults, {
        width: {"type":"number", "default": 800},
        height: {"type":"number", "default": 600},
        duration: {"type":"number", "default": 8},
        blocking: {"type":"boolean", "default": true},
        clickTagName: {"type":"text", "default":"clickTag"}
    });
})(this.Ads);;/*
   
*/      
;(function(Ads) {
    "use strict";
    Ads.units.VideoSkin = augment(Ads.units.BaseVideoUnit, function(uber) {

        this.constructor = function(loader, $slot, $iframe, options) {
            uber.constructor.call(this, loader, $slot, $iframe, options);
        }

        this.setStyle = function($body) {
            this.resize("100%", 460);
            var styles = uber.setStyle.call($body);
            styles["a.videoskin"] = {
                "position": "absolute",
                "height": "460px",
                "width": "100%",
                "background-position": "top center",
                "background-repeat": "no-repeat",
                "background-image": "url("+this.options.skin_image_url+")",
                "z-index": 1
            };


            styles[".video-ad"] = {
                "width": "352px",
                "height": "198px",
                "position": "absolute",
                "z-index": "2",
                "left": "50%",
                "top": "40px",
                "margin-left": "140px"
            }

            if (this.options.gradient) {
                var bodyBackground = window.parent.$("body").css("background-color");
                styles["a.wallpaper"] =  {
                    "background-position": "top",
                    "background-repeat": "no-repeat",
                    "-webkit-box-shadow": "inset 0px -100px 100px -30px " + bodyBackground ,
                    "-mox-box-shadow":  "inset 0px -100px 100px -30px " + bodyBackground,
                    "box-shadow": "inset 0px -100px 100px -30px " + bodyBackground,
                    "height": "460px",
                    "width": "100%",
                    "position": "absolute",
                    "z-index": "1"
                }
            }


            return styles;
        }

        this.setMarkup = function($body) {
            var html = this.utils.template(
                '<a target="_blank" href="{{clickthru}}" class="wallpaper videoskin"></a>',
                this.options );
            $body.html(html);
            uber.setMarkup.call(this, $body);
        };
    })

    Ads.units.VideoSkin.defaults = $.extend({}, Ads.units.BaseVideoUnit.defaults, {
        image: {"type": "image", "default": ""},
        gradient: {"type":"boolean", "default":true}
    });
})(this.Ads);