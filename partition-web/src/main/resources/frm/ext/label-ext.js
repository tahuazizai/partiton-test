/**
 * label标签的扩展：
 * 增加宽度属性，没有属性按自定义的；
 * 增加id属性提供用户添加
 */
!function () {
    "use strict";
    $.widget("ui.label",$.ui.label,{
    	options:{
    		closeable: true,
    		clickable:true
    	},
        _create : function () {
            var width = this.options.width;
            var id = this.options.id;
            
            //执行父类方法
            this._super();
            
            if(!this.options.closeable){
            	this._contentElement.find("button").hide();
            }

            //提供宽度给用户设置
            if(typeof width == 'number'){
                $($(this._contentElement).find(".label-title")[0]).css("width",width);
            }
            if(id !== undefined || id !== null){
                $(this._contentElement).attr("id",id);
            }
            
            var target = this.options.target;
            if(target !== undefined || target !== null){
            	 $(this._contentElement).attr("data-toggle","modal");
            	 $(this._contentElement).attr("data-target",target);
            }
            
        },
        //重新事件处理
        _delegateEvent: function() {
            var me = this;
            var options = me.options;
            this._on(this._contentElement.find("button"), {
                click: function(event) {
                    me.close(event);
                }
            });
            this._on(this._contentElement,{
                click:function(e){ //火狐浏览器为大写BUTTON
                	if(e.target.nodeName === "button" || e.target.nodeName === "BUTTON" || $(e.target).hasClass("glyphicon-remove")){
                		return;
                	}else{
                		me._click(e);
                	};
                }
            })
        },
        
        _click:function(e){
        	if(this.options.clickable){
        		this._trigger('click',e,this);
        	}
        	
        },
        /**
         * 关闭Label,先派发事件，再销毁
         */
        close: function close(e) {
        	if(this.options.closeable){
    		  var optClose = this.options.optClose; //是否自己控制关闭
              this._trigger('close',e,this);
              if(optClose){
                
              }else{
              	this.destroy();
              }
        	}
        },
        
        disabled:function(){
        	this.options.closeable = false;
        	this.options.clickable = true;
        	this._contentElement.find("button").hide();
        },
        enabled:function(){
        	this.options.closeable = true;
        	this.options.clickable = true;
        	this._contentElement.find("button").show();
        }
       
        
    });
}();
