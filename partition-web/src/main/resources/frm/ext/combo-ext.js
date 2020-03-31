/**
 * combo.js扩展，用于combotree、combogrid的容器通用扩展
 */
!function(){
	"use strict";
	function onBodyDown(e) {
        if (this.$content.is(e.target) || $.contains(this.$content[0], e.target) || $.contains(this.$container[0], e.target)) {
            return;
        }
        this.hide();
    };
    
       
	$.combo.prototype.create = function() {
		var p = this.options;
		if(!p.width || p.width == "auto"){
	        this.$content.css('width', this.$container.outerWidth());
		}else{
			this.$content.css('width', p.width);
		}
		$("body").append(this.$content);
	    this.$content.hide();
    };
    
    $.combo.prototype.show = function() {
        this.$content.show();
        this.$content.position({
            my: "left top",
            at: "left bottom",
            of: this.$container,
            collision: "fit flip"
        });
        var p = this.options;
		if(!p.width || p.width == "auto"){
			this.$content.css('width', this.$container.outerWidth());
		}else{
			this.$content.css('width', p.width);
		}
        $("body").on("mousedown", $.proxy(onBodyDown, this));
        if(this.options._show){
        	this.options._show();
        }
    };
}();