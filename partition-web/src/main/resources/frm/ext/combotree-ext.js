!function(){
	"use strict";
	
	$.widget("ui.combotree",$.ui.combotree,{
		_create:function(){
			this._super();
			if(this.options.editable){
				this.comboTree.$input.removeAttr('readonly').removeClass('combo-readonly');
			}
		}
	});
}();