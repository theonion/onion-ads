/*

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
                            self.play();
                        }
                    }
                });
            }
        };

        this.render = function() {
            uber.render.call(this);
            if (this.data_loaded) {
                this.play();
            }
        }

        this.setStyle = function($body) {
            var styles = {
                ".vjs-control-bar":
                     { "display":"none" },
                ".vjs-tech":
                    { "width": "100%" }
                    
                }
            return styles;
        };

        this.setMarkup = function($body) {
            $("#video" + this.slotName, $body).remove();
            $body
                .append('<video id="video-ad' + this.slotName + '" class="video-js vjs-default-skin"></video>')
                .append('<a class="video-clickthru" target="_blank"></a>')
                .append('<a class="video-sound"></a>');
            // find the video tag
            this.$video = $("video", $body)[0];
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
            */
            var self = this;


            if(Ads.videojs.players["video-ad" + this.slotName]) {
                this.player.dispose();
                self.setMarkup();
            }

            var videojsOptions = {
                preload: true,
                controls: true,
                width: 'auto',
                height: 'auto',
                plugins: { controls: false },
            };


            Ads.videojs(self.$video, videojsOptions, function() {
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

                self.player.prevTime = 0;
                self.player.src(self.sources);
                self.player.volume(0);
                self.player.play();
            });
        };

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
        top_right_icon: {"type": "text", "default": "volume-up"},
        behavior: {"type": "select", "default": "", "options": ["enlarge"]},
        video_expand_pixel_tracker: {"type": "pixel", "default": ""},
        video_sound_pixel_tracker:  {"type": "pixel", "default": ""}
    });

})(this.Ads);