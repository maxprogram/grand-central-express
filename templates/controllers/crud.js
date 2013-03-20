var <%=: name | capitalize %> = require('../models/<%=: name | capitalize %>');

// GET /<%= name %>
exports.index = function(req,res) {

    <%=: name | capitalize %>.find(function(err, projects) {
        if (err) throw err;
        res.json(projects);
    });

};

// POST /<%= name %>
exports.create = function(req,res) {

    // Get POST params
    var data = req.params;
    data.created_at = new Date();
    data.updated_at = new Date();

    var <%= name %> = new <%=: name | capitalize %>(data);

    <%= name %>.save(function(err,result){
        if (err) log.error(err);
        res.json(result);
    });

};

// GET /<%= name %>/:id
exports.show = function(req,res) {

    var id = req.param('id');
    <%=: name | capitalize %>.findById(id, function(err,<%= name %>) {
        if (err) throw err;
        res.json(<%= name %>);
    });

};

// PUT /<%= name %>/:id
exports.update = function(req,res) {

    var data = req.body, id = req.param('id');
    delete data.id;
    data.updated_at = new Date();
    <%=: name | capitalize %>.findByIdAndUpdate(id, data, function(err,result){
        if (err) throw err;
        res.json(result);
    });

};

// DELETE /<%= name %>/:id
exports.destroy = function(req,res) {

    var id = req.param('id');
    <%=: name | capitalize %>.findByIdAndRemove(id, function(err){
        if (err) throw err;
    });

};