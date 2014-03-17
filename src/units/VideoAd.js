/*
   
*/      
;
if (window.DMVAST) {

(function(Ads, vast) {
    "use strict";
    Ads.units.Skin = augment(Ads.units.BaseUnit, function(uber) {
        this.constructor = function(loader, $slot, $iframe, options) {
            this.volume = options.volume || 0;
            this.top_right_icon = options.top_right_icon || "volume-up";
            this.video_tag_selector = this.slotName + "_video";
            this.video_tag = this.createVideoTag(this.slotName);

            vast.client.get(options.vast_url, function(res) {
                if (res) {
                    this.setupVAST(res);
                    this.data_loaded = true;
                    this.loader.initializeUnits();
                }
            });
            uber.constructor.call(this, loader, $slot, $iframe, options);
        };

        this.build = function() {
            if (this.data_loaded) {
                uber.build.call();
            }
        };

        this.render = function() {
            this.play(this.volume);
            uber.render.call();
        }

        this.setStyle = function($body) {

        };

        this.setMarkup = function($body) {
            
        };

        this.createVideoTag = function (name) {
            return $('<video>')
                .attr('id', name + '_video')
                .addClass('video-js vjs-default-skin ad-' + name);
        };

        this.play = function(volume) {
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
                videojs(this.video_tag_selector).dispose();
                var videotag = createVideoTag(video_unit.ad_unit.name, video_unit.element_class);
                $(this.ad_unit.video_anchor).prepend(videotag);
            }
            var videojs_options = {
                preload: true,
                controls: false,
                width: 'auto',
                height: 'auto'
            };
            videojs(this.video_tag_selector, videojs_options, function() {
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
                video_unit.startPlayer(video_unit, this, volume);
            });
        };

        this.startPlayer = function() {
            
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

                        var clickthrough = vast.util.resolveURLTemplates(
                            [this.vastTracker.clickThroughURLTemplate],
                            {
                                CACHEBUSTER: Math.round(Math.random() * 1.0e+10),
                                CONTENTPLAYHEAD: this.vastTracker.progressFormated()
                            }
                        )[0];

                        // $(ad_unit.video_anchor)
                        //     .attr("href", clickthrough)
                        //     .click(function(){
                        //         var clicktrackers = this.vastTracker.clickTrackingURLTemplate;
                        //         if (clicktrackers) {
                        //             this.vastTracker.trackURLs(clicktrackers);
                        //         }
                        //     });

                        break;
                    }
                }
                if (this.vastTracker) {
                    this.play(this.volume);
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