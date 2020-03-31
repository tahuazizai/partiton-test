!function(){
	"use strict";
	
	//重载工具提示方法，用于显示手机号码分段（原则上可支持银行卡，如果需要的话）
	$.widget("ui.bsstooltip",$.ui.tooltip,{
		_create: function(){
			this.enabled = true;
			if(this.options.type && this.options.type == "mobile"){
				//如果有设置type项，那么就换一种处理方式
				//mobile：手机号码
				this.onUs = false;
				this.outTimeout = null;
				
                this._on({
                    'click': 'openHandler'
                });

                this._on($(document), {
                    'click': 'closeHandler'
                });
                this._on({
                	'input': '_setContentNoHide'
                });
		        this.options.title = function(){
		        	//自己实现一个工具提示函数
		        	var value = $(this).val();
		        	var result = ''+value;
		        	if(value.length > 3)
		        	{
		        		result = value.substring(0,3)+" ";
		        	}
		        	
		        	if(value.substring(3).length > 4){
		        		result += value.substring(3,7)+" "+value.substring(7);
		        	}else{
		        		result += value.substring(3);
		        	}
		        	
		        	return result;
		        };
		        this.fixTitle();
			}else{
				this._super();
			}
		},
		_setContentNoHide: function(){
            var $tip = this.tip();
            var title = this.getTitle();

            $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title);
            if(!this.options.fontsize){
            	this.options.fontsize = "20px";
            }
            $tip.css('font-size',this.options.fontsize);
            if(title){
            	this.show();
            }else{
            	this.hide();
            }
		}
	});
}();