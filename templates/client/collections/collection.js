var app = app || {};

(function($) {

    var <%=: name | capitalize %>List = Backbone.Collection.extend({
        model: app.<%=: name | capitalize %>,

        url: '/<%= name %>',

        comparator: function(<%=: name | capitalize %>) {
            return <%=: name | capitalize %>.get('id');
        }
    });

    app.<%= name %>List = new <%=: name | capitalize %>List();

})(jQuery);
