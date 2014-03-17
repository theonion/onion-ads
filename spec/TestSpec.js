

describe("Initializes", function() {
    it("totally initializes", function() {
        var ads = new Ads("BaseLoader", {
            //options
            selector: ".ad",
        });
        expect(typeof ads).toEqual("object");
    });
});