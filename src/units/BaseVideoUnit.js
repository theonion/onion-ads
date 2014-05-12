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

})(this.Ads);