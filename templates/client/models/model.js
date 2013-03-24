var app = app || {};

(function($) {

    var <%= name %> = Backbone.Model.extend({
        defaults: {<% fields.forEach(function(f,i){ %>
            <%= f[0] %>: null<%= (i+1==fields.length) ? '' : ',' %><% }); %>
        }
    });

    app.<%= nameLC %> = new <%= name %>();

})(jQuery);
