/*  JsonLoader is pretty chill, by design. 

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
})(this.Ads)