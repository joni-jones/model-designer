(function(Collection){
    // Additional extension layer for Models
    Collection.fullExtend = function(protoProps, staticProps){
        // Call default extend method
        var extended = Collection.extend.call(this, protoProps, staticProps);
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

})(Backbone.Collection);
App.Collections.Table = Backbone.Collection.extend({
    model: App.Models.Field,
    defaults: {
        name: '',
        engine: 'InnoDB',
        charset: 'utf8',
        collation: 'utf8_general_ci'
    }
});
App.Collections.List = Backbone.Collection.extend({
    model: App.Models.Field
});

