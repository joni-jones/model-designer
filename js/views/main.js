(function(View){
    // Additional extension layer for Views
    View.fullExtend = function(protoProps, staticProps){
        // Call default extend method
        var extended = View.extend.call(this, protoProps, staticProps);
        // Add a usable super method for better inheritance
        extended._super = this.prototype;
        // Apply new or different events on top of the original
        if(protoProps.events){
            for(var k in this.prototype.events){
                if(!extended.prototype.events[k]){
                    extended.prototype.events[k] = this.prototype.events[k];
                }
            }
        }
        return extended;
    };

})(Backbone.View);
App.Views.Item = Backbone.View.extend({
    initialize: function(){
        this.model.on('destroy', this.remove, this);
    },
    render: function(){
        var template = _.template($(this.template).html());
        this.$el.html(template(this.model.toJSON()));
        return this;
    },
    remove: function(){
        this.$el.remove();
    }
});
App.Views.Collection = Backbone.View.extend({
    addAll: function(){
        this.collection.each(this.addOne, this);
        this.render();
    },
    addItem: function(model){
        this.collection.add(model);
    },
    addOne: function(){}
});
var TableFieldView = App.Views.Item.fullExtend({
    model: App.Models.Field,
    template: '#table-item',
    tagName: 'li'
});
var TableView = App.Views.Collection.fullExtend({
    model: App.Models.Table,
    tagName: 'div',
    template: '#table',
    attributes: {
        class: 'table-view'
    },
    initialize: function() {
        this.model.collection.on('add', this.addOne, this);
        this.initDraggable();
        this.initDroppable();
    },
    render: function(){
        var template = _.template($(this.template).html());
        this.$el.html(template(this.model.toJSON()));
        return this;
    },
    addOne: function(model) {
        var view = new TableFieldView({model: model});
        this.$el.find('ul').append(view.render().el);
        return this;
    },
    initDraggable: function() {
        this.$el.draggable({
            containment: 'parent',
            cursor: 'pointer',
            snap: true,
            snapTolerance: 10
        });
    },
    initDroppable: function() {
        var self = this;
        self.$el.droppable({
            drop: function(event, ui) {
                /**
                 * @TODO add drop actions
                 */
            }
        });
    }
});
var SchemaView = App.Views.Collection.fullExtend({
    collection: App.Collections.Schema,
    initialize: function() {
        vent.on('table:add', this.addItem, this);
        this.collection.on('add', this.addOne, this);
    },
    addOne: function(model) {
        var self = this;
        var view = new TableView({model: model});
        self.$el.append(view.render().el);
        return self;
    }
});
var FieldItemView = App.Views.Item.fullExtend({
    model: App.Models.Field,
    template: '#list-field',
    tagName: 'a',
    attributes: {
        href: '#',
        class: 'list-group-item'
    },
    initialize: function() {
        this.initDraggable();
    },
    initDraggable: function() {
        this.$el.draggable({
            cursor: 'pointer',
            helper: 'clone',
            appendTo: '.table-view'
        });
    }
});
var FieldListView = App.Views.Collection.extend({
    collection: App.Collections.FieldList,
    initialize: function() {
        this.addAll();
    },
    addOne: function(model) {
        var view = new FieldItemView({model: model});
        this.$el.append(view.render().el);
        return this;
    }
});
var AddTableView = Backbone.View.extend({
    model: App.Models.Table,
    el: '#add-table-modal',
    events: {
        'click .add': 'add'
    },
    add: function() {
        var self = this;
        var model = new App.Models.Table({
            name: self.$el.find('[name="name"]').val(),
            engine: self.$el.find('[name="engine"]').val()
        });
        if (!model.isValid()) {
            alert(model.validationError);
            return false;
        }
        vent.trigger('table:add', model);
        self.$el.modal('hide');
        return true;
    }
});