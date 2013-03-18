var app = app || {};

(function($) {

    app.AppView = Backbone.View.extend({
        el: $(window),
        initialize: function() {
            console.log("App started!");
        }
    });

})(jQuery);
