!function() {
    "use strict";
    
    var templateStr = '<div class="ui-dialog dialog-danger">\
    	<div class="modal-header">\
    	<span class="modal-title"><i class="glyphicon glyphicon-remove-circle margin-right-sm"></i>{{title}}</span>\
    	</div>\
    	<div class="modal-body">\
    	<h3>{{{message}}}</h3>\
    	<p>{{date}}</p>\
		<pre class="stack-content" style="display:none">{{{stack}}}</pre>\
	    </div>\
	    <div class="modal-footer text-right">\
			<button type="button" class="btn btn-danger js-close">确定</button>\
			<button type="button" class="btn btn-default js-stack">查看详情</button>\
	    </div>\
    </div>';
    
    var template = fish.compile(templateStr);
    //解析传入的参数类型，兼容老版本代码
    function parseParam(arg, defaults) {
        var result;

        if (fish.isString(arg)) {
            result = { message: arg };
        } else {
            result = arg || {};
        }

        return _.defaults(result, defaults);
    }
	
	 fish.bsserror = function(message,closeFunc,warnFunc) {
	        var arg = parseParam(message, {
	            modal: true,
	        	width : "80%"
	        }),$content;
	        arg.content =  $content = $(template({
	            title: arg.title || fish.getResource('alert.warn'),
	            okLabel: fish.getResource('alert.ok'),
	            iconClass: 'glyphicon glyphicon-exclamation-sign',
	            btnClass: 'btn-warning',
	            modalClass: 'modal-warning',
	            message: arg.message,
	            stack: arg.stack,
	            date:arg.date
	        }));

	        var promise = fish.popup(arg);	
	        promise.result.always(closeFunc);
	        
	        var $stackContent = $content.find(".stack-content");
	        var openedWindows = fish.modalStack.openedWindows;
        	var $modalElement = openedWindows.get(promise).value.$modalElement;
        	
        	var windowHeight = $(window).outerHeight(true); //窗口的高度
          	var inittop = $modalElement.offset().top; //弹框距离窗口顶部初始化高度
        	var initHeight = $modalElement.height(); //弹框的初始化高度
        	
        	//点击查看详情
	        $content.find('.js-stack').click(function() {
	        	if($stackContent.is(":hidden")){
	        		$stackContent.show();
	        		$stackContent.css("height",windowHeight-200);
	        		$modalElement.css("height",windowHeight); //设置窗口高度
	        		$modalElement.css("top",$(window).scrollTop());
	        		
	        	}else{
	        		$stackContent.hide();
	        		$modalElement.css("height",initHeight);
	        		$modalElement.css("top",inittop);
	        	}
	        });
	        //确认关闭
	        $content.find('.js-close').click(function() {
	        	promise.close(); 
	        });
	        
	       
	        //一键报障
	        $content.find('.js-warn').click(function() {
	        	warnFunc && warnFunc(arg);
	        });
	        
	        
	        return promise;
	    };
}();