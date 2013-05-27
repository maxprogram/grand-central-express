// <%= name %> Model

var AR = require('grand-central-express').ActiveRecord;
module.exports = new AR({

    name: "<%= name %>",

    schema: {<% fields.forEach(function(f,i){ %>
        <%= f[0] %>: <%=: f[1] | capitalize %><%= (i+1==fields.length) ? '' : ',' %><% }); %>
    },

    validations: {},

    methods: {},

    relationships: []

});
