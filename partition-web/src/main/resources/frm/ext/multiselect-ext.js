!function () {
	"use strict";
	
	$.widget("ui.multiselect",$.ui.multiselect,{
		menuMouseup: function (evt) {
			var target;
            target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();
            if(this.options.getSelectedItem){
            	// target.removeClass("active-result");
            	// target.addClass('result-selected'); //点击的LI元素解除可点击状态
            	var itemId = this.results_data[target[0].getAttribute("data-option-array-index")];
                // itemId.selected = true;
            	this.options.getSelectedItem(itemId);
            	return false;			//点击的元素不用再处理，在addValue函数处理
            }
            if (target.length) {		//处理点击LI元素的事件
                this.result_highlight = target;
                this._selectMenu(evt);
                return this.$input.focus();
            }
        },      
        setItemStaus:function(itemId,status){  //status 为 unselected的时候 设置为不选中
            var that = this;
            var item = $(that.$menu[0].childNodes[itemId]);
            var itemData = that.results_data[itemId];
            if(status == 'unselected')
            {     
                itemData.selected = false;
                that.element[0].options[itemId].selected = false;
                item.removeClass("result-selected");
                item.addClass("active-result");
            }
            else
            {
                itemData.selected = true;
                that.element[0].options[itemId].selected = true;
                item.removeClass("active-result");
                item.addClass('result-selected');
            }
        	
        },

        addValue:function(newVal) {	
        	var that =this;
        	if(newVal && newVal.length && newVal.length>0){
	        	for(var i =0; i< newVal.length;i++){
		        	for(var j=0;j<this.options.dataSource.length;j++){
		        		if(newVal[i] == this.options.dataSource[j].value)	{
		        			var high= $(this.$menu.children()[j]);   
		        			var item =this.results_data[j];
                            // this.options.dataSource[j].itemParentId = itemParentId;  // 赋予父区域关系 
		        			this.result_highlight= high;//是子区域成为tar焦点的 Li元素
		        			this._clearHighlightMenu();
		        			high.removeClass("active-result");   //把子区域的LI的点击绑定事件去除，阻止再次点击
		        			item.selected = true;
	               			this.element[0].options[item.options_index].selected = true;
                            this.selected_option_count = null;
                            this.$input.val("");
		        			this._choiceBuild(item);
		        			this.winnow_results();
							this._searchFieldScale();
		        		}
		        	}
	     	   }
     		}
	    }
    });
}();