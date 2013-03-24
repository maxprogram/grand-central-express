var app = app || {};

$(function($) {

    app.<%=: name | capitalize %>View = Backbone.View.extend({
        el: $(""),
        events: {},
        initialize: function() {},
        render: function() {}
    });

});
