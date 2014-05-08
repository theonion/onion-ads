/*
   
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
            styles[".video-clickthru, .video-js"] = {
                "width": "352px",
                "height": "198px",
                "position": "absolute",
                "z-index": "2",
                "left": "50%",
                "top": "40px",
                "margin-left": "140px"
            }
            styles[".video-clickthru"] = {
                "z-index": "3",
                "display": "block"
            }
            styles[".video-js .vjs-tech"] = {
                "width": "100%",
                "height": "100%"
            };
        

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

            this.$iframe.contents().find("head").append(
                "<link href='http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css' rel='stylestyles'>"
            )
            return styles;
        }

        this.setMarkup = function($body) {
            var html = this.utils.template(
                '<a target="_blank" href="{{skin_clickthru_url}}" class="wallpaper videoskin"></a>',
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