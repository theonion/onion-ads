/*

    Ads is responsible for 
    - handling external configuration
    - selecting the appropriate loader
    - defines the ads interface for external use, e.g. 

*/

;(function(global) {
    "use strict";
    var Ads = Ads || function(options) {
        options.targeting = options.targeting || {};

        // initialize 
        this.init = function() {
            
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

        /*  setSelector & setTargeting 

            Use these guys for responsive stuff. You can externally define a resize listener
            that updates the selector used to grab which ads are visible.

        */

        // Change selector used to find slots after Ads has been initiated
        this.setSelector = function(selector) {
            this.options.selector = selector
        }

        // Change targeting after Ads has been initialized. 
        this.setTargeting = function(newTargeting) {
            this.options.targeting = newTargeting;
        }

        this.refresh = function() {
            loader.refresh(targeting);
        }

        this.destroy = function() {
            loader.destroy();
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
        
        this.init();
    }
    global.Ads = Ads;
    global.Ads.units = {};
})(this);