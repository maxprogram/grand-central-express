// <%= name %> Model

module.exports = function(val) {
    return {
        name: "<%= name %>",

        schema: {<% fields.forEach(function(f,i){ %>
            <%= f[0] %>: <%=: f[1] | capitalize %><%= (i+1==fields.length) ? '' : ',' %><% }); %>
        },

        methods: {},

        validations: {}
    };
};