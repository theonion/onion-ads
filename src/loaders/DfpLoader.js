/* Loads ads from DFP */
;(function(Ads) {
    "use strict";
    Ads.DfpLoader = augment(Ads.BaseLoader, function(uber) {
        this.constructor = function(options) {
            console.log("DFP constructor");
            uber.constructor.call(this, options);
        }
    });
})(this.Ads)