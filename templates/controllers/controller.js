// <%=: name | capitalize %> Controller

<% actions.forEach(function(a) { %>
exports.<%= a %> = function(req, res) {
    // res.render('view', {});
    // res.json({});
};
<% }); %>