/*
   
*/      
;(function(Ads) {
    "use strict";
    Ads.units.VideoSkin = augment(Ads.units.VideoUnit, function(uber) {

        this.constructor = function(loader, $slot, $iframe, options) {
            uber.constructor.call(this, loader, $slot, $iframe, options);
        }

        this.setStyle = function($body) {
            this.resize(1460, 460);

            var sheet = {
                "a.videoskin": {
                    position: "absolute",
                    height: "460px",
                    width: "100%",
                    "background-position": "top",
                    "background-repeat": "no-repeat",
                    "background-image": "url("+this.options.skin_image_url+")",
                    "z-index": 1
                },
                ".video-js .vjs-tech": {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%"
                }
            };
            sheet["a.enlarged > div#"+this.video_tag_selector] = {
                left: 0,
                width: "692px!important",
                height: "390px!important"
            };
            sheet["a > div#"+this.video_tag_selector] = {
                width: "346px !important",
                height: "195px !important",
                margin: "46px auto 0",
                position: "relative",
                padding: 0,
                top: "0px",
                left: "317px",
                "overflow-y": "hidden",
                "z-index": 2
            };
            sheet["a > div#"+this.video_tag_selector+" i"] = {
                position: "absolute",
                top: 0,
                right: "2px",
                color: "#fefefe",
                "z-index": 1,
                "font-size": "30px"
            };
            sheet["a > video#"+this.video_tag_selector] = {
                display: "none"
            };

            if (this.options.gradient) {
                var bodyBackground = window.parent.$("body").css("background-color");
                sheet["a.wallpaper"] =  {
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

            var style = this.utils.createStyleSheet(sheet);
            this.$iframe.contents().find("head").append(
                "<link href='http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css' rel='stylesheet'>"
            )
            this.$iframe.contents().find("head").append(style);
        }

        this.setMarkup = function($body) {
            var html = this.utils.template(
                '<a target="_blank" href="{{skin_clickthru_url}}" class="wallpaper videoskin"></a>',
                this.options );
            $body.html(html);
            uber.setMarkup.call(this, $body);
        };
    })

    Ads.units.VideoSkin.defaults = $.extend({}, Ads.units.VideoUnit.defaults, {
        image: {"type": "image", "default": ""},
        gradient: {"type":"boolean", "default":true}
    });

})(self.Ads);