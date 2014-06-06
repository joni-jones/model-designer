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
        this.addAll();
    },
    addOne: function(){}
});
var TableFieldView = App.Views.Item.fullExtend({
    model: App.Models.Field,
    template: '#table-field',
    tagName: 'tr'
});
var TableView = App.Views.Collection.extend({
    collection: App.Collections.Table,
    tagName: 'tbody',
    initialize: function() {
        this.collection.on('add', this.addOne, this);
    },
    addOne: function(model) {
        var view = new TableFieldView({model: model});
        this.$el.append(view.render().el);
        return this;
    }
});
var FielItemView = App.Views.Item.fullExtend({
    model: App.Models.Field,
    template: '#list-field',
    tagName: 'a',
    attributes: {
        href: '#',
        class: 'list-group-item'
    }
});
var FieldListView = App.Views.Collection.extend({
    collection: App.Collections.List,
    initialize: function() {
        this.addAll();
    },
    addOne: function(model) {
        var view = new FielItemView({model: model});
        console.log(view.render().el);
        this.$el.append(view.render().el);
        return this;
    }
});