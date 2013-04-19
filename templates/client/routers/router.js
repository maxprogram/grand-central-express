var app = app || {};

(function($) {

    app.Router = Backbone.Router.extend({
        routes: {
            '': 'home',
            'test': 'test'
        },

        home: function() {
            new app.AppView();
        },

        test: function() {
            this.home();
            gce.log("Router working");
        }
    });

})(jQuery);
