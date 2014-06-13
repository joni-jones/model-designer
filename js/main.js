App.Collections.fieldsCollection = null;
$(document).ready(function() {
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
        console.log(JSON.stringify(schema.getSchema()));
    });
});