$(document).ready(function() {
    var fieldListCollection = new App.Collections.FieldList([
        {name: 'integer'},
        {name: 'tinyint'},
        {name: 'char'},
        {name: 'varchar'},
        {name: 'text'}
    ]);
    //render sidebar fields list
    new FieldListView({
        el: '#field-list-group',
        collection: fieldListCollection
    });

    var tables = new App.Collections.Schema();
    //render main designer with tables
    new SchemaView({
        el: '.designer-container',
        collection: tables
    });

    //dialog view to create new table
    new AddTableView();
});