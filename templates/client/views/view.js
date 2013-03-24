var app = app || {};

$(function($) {

    app.<%=: name | capitalize %>View = Backbone.View.extend({
        el: $(""),
        events: {},
        template: app.jst[''],
        initialize: function() {},
        render: function() {
            return this;
        }
    });

});
