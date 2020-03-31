define([
    "portal/AppGlobal",
    "portal/Utils",
    "portal/RestAPIHelper"
], function ( appGlobal,CommonAction,utils, LoginInfo) {

	//将几个公共模块挂到fish对象上面
	var FishView = fish.View,
  	PortalDef = function () {
		this.appGlobal = appGlobal;
		this.promise = {};
	}

	window.portal = new PortalDef();
    window.portal.utils = utils;

    //全局resize事件派发处理
    function newInit(){
        	var ts = this;
        	
        	this.on('afterRender',function(){
        		ts.resize();
        	});
        	this.listenTo(fish,'view-resize',function(){
        		if(ts.$el.is(":visible")){
        			ts.resize();
        		}
        	});
        	
        	if($.isFunction(this._initialize)){
        		this._initialize();
        	}
     };
    
    var _originExtend = fish.View.extend;
    fish.View.extend = function(obj){
    	if($.isFunction(obj.initialize) && obj.initialize != newInit){
    		obj._initialize = obj.initialize;
    		obj.initialize = newInit;
    	}
    	
    	return _originExtend.call(this,obj);
    };
     
    fish.View = fish.View.extend({
    	resize:$.noop,
    	initialize:newInit
    });
    fish.onResize(function() {
    	fish.trigger("view-resize");
    });
    window.portal.localajax = true; //研发开关，如果为true,自己拼装json数据返回,方便前端研发调试不依赖服务，如果为false，去请求服务端数据


    $.extend(fish,CommonAction);

	fish.utils = utils;

});