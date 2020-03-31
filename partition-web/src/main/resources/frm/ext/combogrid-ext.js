! function(){
	"use strict";

	/**
	 * fish.grid控件扩展
	 */
	$.widget('ui.combogrid',$.ui.combogrid,{
		//修改：让value设置值的判定不再局限于字符串，放宽全等限制
        value: function(){
            var that = this;
            if(arguments[0]){
                var val = arguments[0];
                var data = this.gridContainer.grid("getGridParam").data;
                if(!_.isArray(val)){
                    var valIndex = fish.findIndex(data, function(data){
                        return data[that.dataValueField] == val;
                    });
                    this.gridContainer.grid("setSelection", data[valIndex]);
                    //调整赋值模式：如果没有在grid的data内找到值，那检查传来的值是否对象，如果是，则把这个对象作为新值
                    if(data[valIndex]){
                    	this._value = data[valIndex];
                    }else if(_.isObject(val) && val[that.dataValueField]){
                    	this._value = val;
                    }
                    this._setTextByValue();
                } else if(_.isArray(val) && this.options.gridOpt.multiselect){
                    this.gridContainer.grid("setAllCheckRows", false);
                    this.gridContainer.grid("setCheckRows", val, true);
                    this._value = fish.filter(data, function(item){
                        return fish.indexOf(val, item[that.dataValueField]) !== -1;
                    })
                    this._setTextByValue();
                }
            } else {
                if($.isArray(this._value)) {
                    return this.options.dataValueField ? $.map(this._value, function(val){
                        return val[that.dataValueField];
                    }): this._value;
                } else {
                    return this._value && this.options.dataValueField ? this._value[this.dataValueField] : this._value;
                }
            }
        },

        // 修正selectedRows可能出现undefined的问题
        _setTextByValue: function(){
            var that = this;
            if($.isArray(this._value)) {
                var selectedRows = this.gridContainer.grid("getCheckRows");
                this.text($.map(selectedRows, function(val){
                    return val ? val[that.dataTextField] : undefined
                }).join(','));
            } else {
                this.text(this._value[this.dataTextField]);
            }
        },
	});
}();