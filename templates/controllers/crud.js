
// GET /<%= name %>
exports.index = function(req,res,models) {

    models.<%=: name | capitalize %>.find(function(err, projects) {
        if (err) throw err;
        res.json(projects);
    });

};

// POST /<%= name %>
exports.create = function(req,res,models) {

    // Get POST params
    var data = req.params;
    // data must contain ALL fields
    data.created_at = new Date();
    data.updated_at = new Date();

    models.<%=: name | capitalize %>.create(data, function(err,result){
        if (err) throw err;
        res.json(result);
    });

};

// GET /<%= name %>/:id
exports.show = function(req,res,models) {

    var id = req.param('id');
    models.<%=: name | capitalize %>.findById(id, function(err,<%= name %>) {
        if (err) throw err;
        res.json(<%= name %>);
    });

};

/*
 * ORM doesn't have update/delete functions yet
// PUT /<%= name %>/:id
exports.update = function(req,res,models) {

    var data = req.body, id = req.param('id');
    delete data.id;
    data.updated_at = new Date();
    models.<%=: name | capitalize %>.findByIdAndUpdate(id, data, function(err,result){
        if (err) throw err;
        res.json(result);
    });

};

// DELETE /<%= name %>/:id
exports.destroy = function(req,res,models) {

    var id = req.param('id');
    models.<%=: name | capitalize %>.findByIdAndRemove(id, function(err){
        if (err) throw err;
    });

};
/*
