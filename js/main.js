App.Collections.fieldsCollection = null;
App.Models.currentRelation = null;
$(document).ready(function() {
    var container = '.designer-container';
    App.Collections.fieldsCollection = new App.Collections.FieldList([
        new IntegerModel(),
        new TinyIntModel(),
        new CharModel(),
        new VarcharModel()
    ]);
    //render sidebar fields list
    new FieldListView({
        el: '#field-list-group',
        collection: App.Collections.fieldsCollection
    });

    var tables = new App.Collections.Schema();
    //render main designer with tables
    var schema = new SchemaView({
        el: '.designer-container',
        collection: tables
    });

    //dialog view to create new table
    new AddTableView();
    
    $('.save-schema').on('click', function(e) {
        e.preventDefault();
        alert(JSON.stringify(schema.getSchema()));
    });

    //create relation
    $('.add-relation').on('click', function(e) {
        e.preventDefault();
        if (!App.Views.paper) {
            var $container = $(container);
            App.Helpers.paper = new Raphael($container, $container.width(), $container.height());
        }
        App.Models.currentRelation = new App.Models.Relation();
    });
});