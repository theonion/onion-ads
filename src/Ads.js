/*

    Ads is responsible for 
    - handling external configuration
    - selecting the appropriate loader
    - defines the ads interface for external use, e.g. 

*/

;(function(global) {
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
    global.Ads = Ads;
    global.Ads.units = {};
})(this);