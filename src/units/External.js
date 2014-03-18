/*
   
*/      
;(function(Ads) {
    "use strict";
    Ads.units.External = augment(Ads.units.BaseUnit, function(uber) {
        this.constructor = function(loader, $slot, $iframe, options) {
            uber.constructor.call(this, loader, $slot, $iframe, options);

            //Pretend this is your VAST request... 
            console.log("Loading external resource from External's constructor");
            $.ajax(this.options.resource, {success: $.proxy(this.onDataReady, this)});
        }



        /* This is called when the ajax request is done... */
        this.onDataReady = function (data) {
            console.log("Data Ready");
            this.data = data;
            this.dataReady = true;
            //However, you don't want to trigger the action until you know the ad is "built", in case it was bloked...
            if (this.built) {
                console.log("Data is ready after build is called, do your action...");
                this.doAction();
            }
            else  {
                console.log("Data is ready, but unit isn't built. Waiting...");
            }
        }

        /* You'll need the build method to call your action, too, if the data is ready before the the the units build method is called
            I'd override render() since that is already inside the build function & has the conditional preventing it from being called
            multiple times already there.
        */

        this.render = function() {
            console.log("Data is before build is called, do your action...");
            if (this.dataReady) {
                this.doAction();    
            }
            else {
                console.log("Unit is built ad ready, but data hasn't com in. Waiting...");
            }
            uber.render.call(this);
        }



        /*This is the action you want to take after VAST is loaded... 
            - You still want build to render the ad
            - You don't want to wait for the VAST request to complete before the skin is displayed in the case of the video skin...
            - ... but you may want to delay an action, like initializing the player or calling video play. 
        */
        this.doAction = function() {
            console.log("Data is loaded. Ad is built. I'm ready to party", this.data);
        }

        this.setStyle = function($body) {
            this.resize(1460, 300);
        }

        this.setMarkup = function($body) {
            var html = this.utils.template(
                "Ad contents...", this.options );
            $body.html(html);
        };
    })

})(self.Ads);