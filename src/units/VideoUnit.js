/*
   
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