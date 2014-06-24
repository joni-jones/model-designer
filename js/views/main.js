(function(View){
    'use strict';
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
    events: {
        'change input': 'changed',
        'change select': 'changed'
    },
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
    },
    changed: function(e) {
        var self = this;
        var changed = e.currentTarget;
        var obj = {};
        obj[changed.name] = $(changed).val();
        self.model.set(obj);
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
    tagName: 'li',
    events: {
        'click span': 'addRelation'
    },
    addRelation: function() {
        if (App.Models.currentRelation === null) {
            return false;
        }
        var model = App.Models.currentRelation;
        var column = this.model.get('name');
        var id = this.model.get('id');
        var tableName = this.$el.parents('.table-view').find('.table-head .text-center').text();
        if (!model.get('ref_id')) {
            model.set('ref_id', id);
            model.set('ref_column', column);
            model.set('ref_table', tableName);
        } else {
            model.set('id', id);
            model.set('column', column);
            model.set('name', 'fk_' + tableName + '_' + model.get('ref_table'));
            vent.trigger('relation:add', model);
            App.Models.currentRelation = null;
        }
        return true;
    }
});
var TableView = Backbone.View.extend({
    model: App.Models.Table,
    tagName: 'div',
    template: '#table',
    attributes: {
        class: 'table-view'
    },
    initialize: function() {
        this.model.collection.on('add', this.addOne, this);
        vent.on('relation:add', this.addRelation, this);
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
        var self = this;
        this.$el.draggable({
            containment: 'parent',
            cursor: 'pointer',
            snap: true,
            snapTolerance: 10,
            stop: function(e, ui) {
                self.repaintRelations();
            }
        });
    },
    initDroppable: function() {
        var self = this;
        self.$el.droppable({
            drop: function(e, ui) {
                var model = App.Collections.fieldsCollection.get(ui.draggable.find('span').data('id'));
                self.addItem(model);
            }
        });
    },
    addItem: function(model) {
        var item = new App.Models.Field(model.attributes);
        item.set('id', item.cid);
        this.model.collection.add(item);
    },
    addRelation: function(model) {
        var relationModel = this.model.collection.get(model.get('id'));
        if (typeof(relationModel) === 'undefined') {
            return false;
        }
        this.model.relations.add(model);
        this.drawRelation(model.get('id'), model.get('ref_id'));
        return true;
    },
    drawRelation: function(startId, endId) {
        console.log('draw relation');
        var startPos = $('[data-field-id=' + startId + ']').offset();
        var endPos = $('[data-field-id=' + endId + ']').offset();
        var topRatio = 15; //ration to center line point
        var leftRatio = 6;
        var x1 = parseInt(startPos.left, 10) - leftRatio;
        var y1 = parseInt(startPos.top, 10) + topRatio;
        var x2 = parseInt(endPos.left, 10) - leftRatio;
        var y2 = parseInt(endPos.top, 10) + topRatio;
        var path = 'M' + x1 + ' ' + y1;
        path += ' L' + x2 + ' ' + y2;
        console.log(path);
        App.Helpers.paper.path(path);
        App.Helpers.paper.safari(); //call to avoid bug in safari browsers
    },
    repaintRelations: function() {
        var self = this;
        if (self.model.relations.length) {
            self.model.relations.each(function(model) {
                self.drawRelation(model.get('id'), model.get('ref_id'));
            }, self);
        }
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
    },
    getSchema: function() {
        var self = this;
        var arr = [];
        self.collection.each(function(model) {
            var obj = model.attributes;
            obj.fields = [];
            if (typeof model.collection !== 'undefined' && model.collection.length) {
                model.collection.each(function(field) {
                    obj.fields.push(field.attributes);
                });
            }
            arr.push(obj);
        });
        return arr;
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
        App.Views.Item.prototype.initialize.apply(this);
        _.bindAll(this, 'changed');
        this.initDraggable();
    },
    initDraggable: function() {
        this.$el.draggable({
            cursor: 'pointer',
            helper: 'clone',
            zIndex: 1500
        });
    },
    render: function() {
        this.model.set('id', this.model.cid);
        return App.Views.Item.prototype.render.apply(this);
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
var RelationView = Backbone.View.extend({
    model: App.Models.Relation,
    initialize: function() {
        vent.on('create-relation:finish', this.setDefaultCursor, this);
        this.setRelationCursor();
    },
    setDefaultCursor: function() {
        this.setCursor('default');
    },
    setRelationCursor: function() {
        this.setCursor('cell');
    },
    setCursor: function(cursor) {
        $('html').css({
            'cursor': cursor
        });
    }
});