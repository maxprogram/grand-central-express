// <%= name %> Model

var Model = require('grand-central-express').Model;

module.exports = new Model({

    name: "<%= name %>",

    schema: {<% fields.forEach(function(f,i){ %>
        <%= f[0] %>: <%=: f[1] | capitalize %><%= (i+1==fields.length) ? '' : ',' %><% }); %>
    },

    validations: {},

    methods: {},

    relationships: []

});
