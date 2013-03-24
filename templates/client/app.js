
//= require_tree ./models
//= require_tree ./collections
//= require_tree ./views
//= require_tree ./routers

var app = app || {};

(function($) {

    $(function () {
        app.router = new app.Router();
        Backbone.history.start();
    });

})(jQuery);
