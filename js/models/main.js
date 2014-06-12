(function(Model){
    // Additional extension layer for Models
    Model.fullExtend = function(protoProps, staticProps){
        // Call default extend method
        var extended = Model.extend.call(this, protoProps, staticProps);
        // Add a usable super method for better inheritance
        extended._super = this.prototype;
        // Apply new or different defaults on top of the original
        if(protoProps.defaults){
            for(var k in this.prototype.defaults){
                if(!extended.prototype.defaults[k]){
                    extended.prototype.defaults[k] = this.prototype.defaults[k];
                }
            }
        }
        return extended;
    };

})(Backbone.Model);
App.Models.Field = Backbone.Model.extend({
    defaults: {
        name: '',
        is_null: false, 
        default_value: '',
        is_pk: false, 
        precision: '',
        type: null
    }
});
App.Models.Table = Backbone.Model.extend({
    defaults: {
        name: '',
        engine: 'InnoDB',
        charset: 'utf8',
        collation: 'utf8_general_ci'
    },
    initialize: function() {
        this.collection = new App.Collections.FieldList();
    },
    validate: function(attrs, options) {
        if (!attrs.name) {
            return 'Name should not be empty';
        }
        if (!attrs.engine) {
            return 'Engine should not be empty';
        }
    }
});
var NumberModel = App.Models.Field.fullExtend({
    defaults: {
        auto_increment: false,
        unsigned: true,
        default_value: 0
    }
});
var CharModel = App.Models.Field.fullExtend({
    defaults: {
        precision: 10,
        type: 'char',
        name: 'char'
    }
});
var VarcharModel = App.Models.Field.fullExtend({
    defaults: {
        precision: 60,
        type: 'varchar',
        name: 'varchar'
    }
});
var IntegerModel = NumberModel.fullExtend({
    defaults: {
        precision: 8,
        type: 'integer',
        name: 'integer'
    }
});
var TinyIntModel = NumberModel.fullExtend({
    defaults: {
        precision: 4,
        type: 'tinyint',
        name: 'tinyint'
    }
});

