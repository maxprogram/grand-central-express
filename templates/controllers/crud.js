
// GET /<%= name %>
exports.index = function(req,res,models) {

    models.<%=: name | capitalize %>.all(function(err, rows) {
        if (err) throw err;
        res.json(rows);
    });

};

// POST /<%= name %>
exports.create = function(req,res,models) {

    var data = req.body;
    data.created_at = new Date();
    data.updated_at = new Date();

    models.<%=: name | capitalize %>.create(data, function(err, <%= name %>){
        if (err) throw err;
        res.json(<%= name %>);
    });

};

// GET /<%= name %>/:id
exports.show = function(req,res,models) {

    var id = req.param('id');
    models.<%=: name | capitalize %>.find(id, function(err, <%= name %>) {
        if (err) throw err;
        res.json(<%= name %>);
    });

};

// PUT /<%= name %>/:id
exports.update = function(req,res,models) {

    var data = req.body, id = req.param('id');
    delete data.id;
    data.updated_at = new Date();
    models.<%=: name | capitalize %>.findByIdAndUpdate(id, data, function(err, result){
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
