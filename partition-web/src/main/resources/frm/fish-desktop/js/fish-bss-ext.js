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
/**
 * 文件展示组件
 *  $(element).fileshow(option);
 */
!function() {
	'use strict';
	
	var fileTemp = '<li class="col-md-6 file-upload-cont"><div class="file-upload">'+
						'<div class="file-media js-file-msg">'+
							'<div class="file-media-left"><img class="media-object js-file-image" src="" alt="..."></div>'+
							'<div class="file-media-body"><div class="file-media-main"><h4 class="file-media-heading js-file-name"></h4>'+
								'<div class="upload-body">'+
									'<span class="memory js-file-size"></span>'+
									'<span class="percent js-file-process"></span>'+
								'</div></div>'+
							'</div>'+
						 '</div>'+
						 '<div class="float-upload js-file-opt"><div class="float-upload-cont">'+
							 '<div class="col-md-4"><a class="js-file-down"><i class="glyphicon glyphicon-download-alt"></i><span>下载</span></a></div>'+
							 '<div class="col-md-4"><a class="js-file-read"><i class="glyphicon glyphicon-eye-open"></i><span>查看</span></a></div>'+
							 '<div class="col-md-4"><a class="js-file-del"><i class="glyphicon glyphicon-trash"></i><span>删除</span></a></div>'+
						 '</div></div>'+
					'</div></li>';
	
	$.widget("ui.bssfileshow", {
        options: {
        	name:"", //文件名称
        	url:"",//文件下载路径
        	size:"",//文件大小
        	upprocess:0,//上传进度
        	imagePath:"",//图标路径
        	downfile:$.noop,//下载文件方法
        	readfile:$.noop,//查看文件方法
        	delfile:$.noop//删除文件方法
        },
        _create:function(){
        	this.element.append(fileTemp);
        	
        	this.$fileMsg = $(".js-file-msg");
        	this.$fileImage = $(".js-file-image");
        	this.$fileName = $(".js-file-name");
        	this.$fileSize = $(".js-file-size");
        	this.$fileProcess = $(".js-file-process");
        	
        	
        	this.$fileOpt = $(".js-file-opt");
        	this.$fileDown = $(".js-file-down");
        	this.$fileRead = $(".js-file-read");
        	this.$fileDel = $(".js-file-del");
        	
        },
        _init:function(){
        	this._checkFileImage();
        	this.$fileImage.attr("src",this.options.imagePath);
        	this.$fileName.html(this.options.name);
        	this.$fileSize.html(this.options.size);
        	
        	this._bindEvent();
        	this.$fileOpt.hide();
        	this.element.show();
        },
        _checkFileImage:function(){
        	var image = "image/colorlump-";
        	var fileName = this.options.name;
			if(/(?:jpg|gif|png|jpeg)$/i.test(fileName)) { 
				image +="images";
			}else if(/(?:mp3|mp4)$/i.test(fileName)){
				image +="audio";
			}else if(/(?:pdf)$/i.test(fileName)){
				image +="pdf";
			}else if(/(?:doc|docx)$/i.test(fileName)){
				image +="docx";
			}else if(/(?:xls|xlsx)$/i.test(fileName)){
				image +="xls";
			}else{
				image +="other";
			}
			this.options.imagePath = image + '@2x.png';
        },
        _bindEvent:function(){
        	var that = this;
        	this._on(this.$fileMsg,{
        		"mouseenter": "_fileMsgMouseenter",
        	});
        	this._on(this.$fileOpt,{
        		"mouseleave ": "_fileMsgMouseleave"
        	});
        	
        	this._on(this.$fileDown,{
        		"click": "_downLoadFile"
        	});
        	
        	this._on(this.$fileRead,{
        		"click": "_readFile"
        	});
        	
        	this._on(this.$fileDel,{
        		"click": "_delFile"
        	});
        },
        
        _downLoadFile:function(e){
        	//window.location.href = this.options.url;
        	console.log('_downLoadFile...');
        	this._trigger("downfile", e, this.url);
        },
        
        _readFile:function(e){
        	console.log('_readFile...');
        	this._trigger("readfile", e, this.url);
        },
        
        _delFile:function(e){
        	console.log('_delFile...');
        	this._trigger("delfile", e, this.url);
        },
        
        _fileMsgMouseenter:function(){
        	console.log('_fileMsgMouseenter...');
        	this.$fileOpt.show();
        },
        _fileMsgMouseleave:function(){
        	console.log('_fileMsgMouseleave...');
        	this.$fileOpt.hide();
        },
        setFileProcess:function(process){
        	this.options.upprocess = process;
        	this.$fileProcess.html(process+"%已上传");
        }
       
    
    });
}();
  
/*
 * 垂直流程轴用parentID
 * */
(function() {
    "use strict";
    //流程轴的容器
    var flow_container = '<ul class="flowaxis"></ul>';

    /*
    * 顶级元素才用到
    * primary-state 蓝色（当前处理中）
    * success-state 绿色(成功通过) (默认)
    * warning-state 黄色(出现问题)
    * error-state 红色（否决）
    * */
    //每个流程的容器
    var flow_item_container = '' +
        '<li class="flowaxis-item row">' +
            '<div class="col-sm-2 flowaxis-item-col">'+
                '<div class="flowaxis-item-title">'+
                    '<div class="flowaxis-item-num-dot success-state"></div>'+
                    '<span class="flowaxis-item-span-widget"></span>'+
                '</div>'+
            '</div>' +
            '<div class="col-sm-10 flowaxis-item-col">'+
                '<div class="flowaxis-item-main">'+
                '</div>'+
            '</div>'+
        '</li>';

    //每个流程审批节点审批
    var flow_item_approve_content = '<div class="flowaxis-item-content" name="content">'+
        '<div class="flowaxis-item-heading">'+
        '<span class="flowaxis-text-title-widget"></span>'+
        '<span class="text-primary"></span>'+
        '<span class="pull-right flowaxis-item-tools"></span></div>'+
        '<div class="flowaxis-item-body"></div>'+
        '</div>';

    //每个流程审批节点的回复
    var flow_item_approve_reply = '<div class="flowaxis-item-reply"></div>';

    //流程审批节点的回复的节点审批内容
    var flow_item_reply_content = '<div class="flowaxis-item-content">'+
        '<div class="flowaxis-item-heading">'+
        '<span class="flowaxis-text-title-widget"></span>'+
        '<span class="text-primary"></span>'+
        '<span class="pull-right flowaxis-item-tools"></span></div>'+
        '<div class="flowaxis-item-body"></div>'+
        '</div>';

    var  NotParentNodes = [];//储存非顶级对象
    var templateNodes = [];//用来储存顶级节点
    $.widget('ui.bssflowaxis',{
        //外面传入参数(第一层只能一层)
        options: {
            dataSource : []//流程数
        },
        //创建控件方法
        _create : function(){
            this._initWidget();
        },
        //初始化方法
        _initWidget : function(){

            var options = this.options;
            //流程总数
            this.flowLength = 0;
            if (options.dataSource && options.dataSource.length > 0) {
                this.flowLength = options.dataSource.length;
            }
            var ulEle = $(flow_container);

            var root = {
                id : '-1',
                hasChild : false,
                ls : false
            };
            //添加顶级节点
            this._addTopNodes(ulEle,this.flowLength);
            for(var i=0;i<templateNodes.length;i++){
                //添加节点
                this._addNodes(ulEle,NotParentNodes,templateNodes[i]);
            }

            //添加流程轴容器
            this.element.append(ulEle);
            NotParentNodes = [];
            templateNodes = [];
        },

        _addTopNodes : function(ulEle,flowLength){
            var options = this.options;
            // var count = 0;//记录父元素的个数
            var li_count = 0;//记录顶级元素
            //先将根元素添加到ulEle

            for(var i=0;i<flowLength;i++){
                var pid = options.dataSource[i].pid;
                if(pid == '-1'){
                    //如果等于-1是根节点;
                    ulEle.append(flow_item_container);
                    //为li添加数据的id属性
                    ulEle.find('li').eq(li_count).attr("id",options.dataSource[i].id + "_li");
                    ulEle.find('.flowaxis-item-main').eq(li_count).attr("id",options.dataSource[i].id + "_itemMain");

                    var data = options.dataSource[i];
                    var itemNum = options.dataSource[i].itemNum;
                    if(itemNum == undefined || itemNum == null){
                        itemNum = " ";
                    }
                    var itemName = options.dataSource[i].itemName;
                    if(itemName == undefined || itemName == null){
                        itemName = " ";
                    }
                    var itemHeading = data.itemHeading;
                    if(itemHeading == undefined || itemHeading == null){
                        itemHeading = " ";
                    }
                    var itemTextPrimary = data.itemTextPrimary;
                    if(itemTextPrimary == undefined || itemTextPrimary == null){
                        itemTextPrimary = " ";
                    }
                    var itemTime = options.dataSource[i].itemTime;
                    if(itemTime == undefined || itemTime == null){
                        itemTime = " ";
                    }
                    var itemBody = options.dataSource[i].itemBody;
                    if(itemBody == undefined || itemBody == null){
                        itemBody = " ";
                    }

                    //添加左边根元素数据
                    ulEle.find('.flowaxis-item-num-dot:eq('+li_count+')').text(itemNum);
                    //流程球添加样式 flowaxis-item-num-dot
                    /*
                    * primary-state 蓝色（当前处理中）success-state
                    * success-state 绿色(成功通过) (默认) pass
                    * warning-state 黄色(出现问题) warning-state
                    * error-state 红色（否决） reject
                    */
                    var dotElement = ulEle.find('.flowaxis-item-num-dot:eq('+li_count+')');
                    var dot_style = options.dataSource[i].flowState;
                    if(dot_style){
                        dotElement.removeClass('success-state');
                        if(dot_style == 'pass'){//通过
                            dotElement.addClass('success-state');
                        } else if(dot_style == 'handle'){//处理中
                            dotElement.addClass('primary-state');
                        } else if(dot_style == 'warning'){//出现问题
                            dotElement.addClass('warning-state');
                        } else if(dot_style == 'reject'){//否决
                            dotElement.addClass('error-state');
                        }
                    }

                    ulEle.find('.flowaxis-item-span-widget:eq('+li_count+')').text(itemName);
                    //右边子流程添加content
                    ulEle.find('.flowaxis-item-main').eq(li_count).append(flow_item_approve_content);
                    ulEle.find('.flowaxis-item-content').eq(li_count).attr("id",options.dataSource[i].id + "_itemContent");
                    //添加右边根元素数据
                    ulEle.find('.flowaxis-item-main').eq(li_count).find('.flowaxis-item-content[name="content"]').eq(0).find('.flowaxis-text-title-widget').eq(0).text(itemHeading);
                    ulEle.find('.flowaxis-item-main').eq(li_count).find('.flowaxis-item-content[name="content"]').eq(0).find('.text-primary').eq(0).text(itemTextPrimary);
                    ulEle.find('.flowaxis-item-main').eq(li_count).find('.flowaxis-item-content[name="content"]').eq(0).find('.flowaxis-item-tools').eq(0).text(itemTime);
                    ulEle.find('.flowaxis-item-main').eq(li_count).find('.flowaxis-item-content[name="content"]').eq(0).find('.flowaxis-item-body').eq(0).text(itemBody);

                    templateNodes.push(options.dataSource[i]);//储存顶级节点
                    li_count++;
                } else {
                    NotParentNodes.push(options.dataSource[i]);
                }
            }
            li_count = 0;
        },

        /**
         * 渲染元素
         * */
        _createNode : function(ulEle,NotParentNodes,currentNode,n){
            var pid = currentNode.pid;
            //查找父元素的li
            var itemContentEle =  ulEle.find('#'+pid+"_itemContent");
            //给reply添加id
            var flow_item_approve_reply_hasId = $(flow_item_approve_reply).attr("id",currentNode.id + "_reply");

            //给reply元素添加id
            var flow_item_reply_content_hasId = $(flow_item_reply_content).attr("id",currentNode.id + "_itemContent");
            //给reply元素添加content元素
            flow_item_approve_reply_hasId.append(flow_item_reply_content_hasId);
            //插入兄弟节点
            flow_item_approve_reply_hasId.insertAfter(itemContentEle);

            var itemHeading = currentNode.itemHeading;
            if(itemHeading == undefined || itemHeading == null){
                itemHeading = " ";
            }
            var itemTextPrimary = currentNode.itemTextPrimary;
            if(itemTextPrimary == undefined || itemTextPrimary == null){
                itemTextPrimary = " ";
            }
            var itemTime = currentNode.itemTime;
            if(itemTime == undefined || itemTime == null){
                itemTime = " ";
            }
            var itemBody = currentNode.itemBody;
            if(itemBody == undefined || itemBody == null){
                itemBody = " ";
            }

            ulEle.find("#"+ currentNode.id + "_itemContent").find('.flowaxis-text-title-widget').eq(0).text(itemHeading);
            ulEle.find("#"+ currentNode.id + "_itemContent").find('.text-primary').eq(0).text(itemTextPrimary);
            ulEle.find("#"+ currentNode.id + "_itemContent").find('.flowaxis-item-tools').eq(0).text(itemTime);
            ulEle.find("#"+ currentNode.id + "_itemContent").find('.flowaxis-item-body').eq(0).text(itemBody);

            this._addNodes(ulEle,NotParentNodes,currentNode);
        },

        /**
         * 添加节点
         * ulEle：ul根元素jq对象；
         * flowLength：传入的数组长度
         */
        _addNodes : function(ulEle,NotParentNodes,templateNode){
            var n = 0;
            var notParentNodesLength = NotParentNodes.length;
            for(n;n<notParentNodesLength;n++){
                var pid = NotParentNodes[n].pid;
                if(pid == templateNode.id){
                    //把遍历出来的对象的数据赋值给currentNode
                    var currentNode = NotParentNodes[n];
                    //父节点的对象给_p属性
                    currentNode._p = templateNode;
                    currentNode._ai = n;
                    //检查是否有子元素和是否是最后一个元素
                    this._checkIsHaveChildAndLast(currentNode,NotParentNodes);
                    //渲染元素
                    this._createNode(ulEle,NotParentNodes,currentNode,n);

                    if(currentNode.ls){
                        break;
                    }
                }
            }
        },

        /**
         * 检查是否有子元素和是否是最后一个元素
         * */
        _checkIsHaveChildAndLast : function(currentNode,NotParentNodes){
            // var options = this.options;
            var lastId;
            for(var n=0;n<NotParentNodes.length;n++){
                if(NotParentNodes[n].pid == currentNode.id){
                    currentNode.hasChild = true;
                }
                if(NotParentNodes[n].pid == currentNode.pid){
                    lastId = NotParentNodes[n].id;
                }
            }
            if(lastId == currentNode.id){
                currentNode.ls = true;
            }
        },
        /**
         * 重新加载数据
         * param datas 数据组
         * */
        reloadData: function(datas) {
            var that = this;
            this.element.empty();
            this.options.dataSource = datas;
            that._initWidget();
        }
    });
})();

















/**
 * 小助手helper
 * */
(function(){
    "use strict";

    //helper容器
    var  helperContainer = '' +
        '<div class="helper-container" >\
            <div class="helper-main">\
                <button  class="btn btn-primary helper-switch" type="button" title=""></button>\
                <ul class="helper-menu">\
                </ul>\
            </div>\
        </div>';

    var liContainer = '<li class="menu-item"><!--<i class="menu-item-icon iconfont icon-gene-shopping-cart"></i>--></li>';

    $.widget('ui.bsshelper',{
        options : {
            /*
            * id : 'id'每个li的id
            * text : '文本',
            * iconStyle : '图标样式'
            * */
            dataSource : [],//每个栏目
            direction : "default",//默认靠右
            hint : "default",//默认没有提示信息
            mouseover : false//三角形图标是点击事件还是触发事件
        },
        //创建控件方法
        _create : function(){
            this._initWidget();
        },
        //初始化方法
        _initWidget : function(){
            var items = this.options;
            this.itemLength = 0;
            if(items.dataSource && items.dataSource.length > 0){
                this.itemLength = items.dataSource.length;
            } else {
                return;
            }
            var container = $(helperContainer);
            //渲染item
            this._renderItem(container,this.itemLength);
            //控制组件靠左还是靠右，默认靠右
            this._controlDirection(container);

            this.element.append(container);
            //触发打开关闭事件
            this._delegateEvent();
            this._createHintMessage();
        },
        /**
         * 渲染每个item
         * */
        _renderItem : function(container,itemLength){
            for(var i=0;i<itemLength;i++){
                this._addNode(container,i);
            }
        },
        /**
         * 拼接每个item的html
         * */
        _addNode : function(container,num){
            //拼接每个li
            container.find('.helper-menu').append(liContainer);
            //获取每个传入的对象
            var itemObject = this.options.dataSource[num];
            //渲染文本内容
            container.find('.menu-item').eq(num).append(itemObject.text);
            //给每个li绑定个id
            if(itemObject.id){
                container.find('.menu-item').eq(num).attr('id','helper_item_'+ itemObject.id);
            }
            //渲染style
            // this._addStyle(container,num);

        },
        /**
         * 渲染style
         * */
        _addStyle : function(container,num){
            var itemObject = this.options.dataSource[num];
            if(itemObject.iconStyle != undefined){
                container.find('.menu-item-icon').eq(num).removeClass('icon-gene-shopping-cart');
                container.find('.menu-item-icon').eq(num).addClass(itemObject.iconStyle);
            }
        },
        /**
         * 控制组件靠左还是靠右，默认靠右
         * */
        _controlDirection : function(container){
            var direction = this.options.direction;
            if(direction != undefined || direction != null
                || direction != 'right'){
                container.find('.helper-container').addClass("position-left");
            }
        },
        /**
         * 控制靠左靠右
         * */
        toogleDirection : function(){
            var helperContainer = $(this.element).find(".helper-container");
            if(helperContainer.hasClass('position-left')){
                helperContainer.removeClass('position-left');
            } else {
                helperContainer.addClass('position-left');
            }
        },
        /**
         * 注册事件
         * */
        _delegateEvent : function () {
            this._on({
                'click .helper-switch' : '_openOrClose',
                'mouseover .helper-switch' : '_openOrCloseByMouseover',
                'mouseleave' : '_closeHelperContainer'
            });
            this._bindItemEvent();
        },
        /**
         * 鼠标离开div class="helper-container 隐藏该div
         * */
        _closeHelperContainer : function(){
            var container = $(this.element).find('.helper-container');
            container.removeClass('open');
        },
        /**
         * 打开关闭小助手
         * */
        _openOrClose : function(){
            var mouseover_flag = this.options.mouseover;
            if(mouseover_flag == undefined || mouseover_flag == null
                || mouseover_flag == false){
                this._openOrCloseButton();
            }
        },
        _openOrCloseButton : function(){
            var container = $(this.element).find('.helper-container');
            // var containerElement = container.find('.helper-container');
            if(container.hasClass('open')){
                container.removeClass('open');
            } else {
                container.addClass('open');
            }
        },
        /**
        * 绑定每个item事件
        * */
        _bindItemEvent : function () {
            var that = this;
            var options = that.options;
            var container = $(this.element);
            var liElement = container.find('li');
            for(var i=0;i<liElement.length;i++){
                /*(function(num){
                    $(liElement[num]).on('click',function(event){
                        me._trigger("clickitem",event,options.dataSource[num]);
                        return false;
                    });
                })(i);*/
                //每个li元素绑定数据
                $(liElement[i]).data("param", options.dataSource[i]);
                //点击事件
                $(liElement[i]).on('click',function(event){
                    //这里的this是当前被触发点击事件的元素
                    var data = $(this).data("param");
                    that._trigger("clickitem",event,data);
                });
                //鼠标悬停事件
                $(liElement[i]).on('mouseover',function(event){
                    var data = $(this).data("param");
                    that._trigger("mouseoveritem",event,data);
                });
            }
        },
        /**
         * 生成tooltip提示语
         * $(".helper-switch").tooltip('show');
         setTimeout(this.hideTooltip,3000);
         * */
        _createHintMessage : function(){
            var  that = this;
            var hintMessage = that.options.hint;
            if(hintMessage != undefined || hintMessage != null){
                $(that.element).find('.helper-switch').attr("title",hintMessage);
                $(that.element).find('.helper-switch').tooltip({placement:'left'});
                $(that.element).find('.helper-switch').tooltip('show');
                setTimeout(function () {
                    $(that.element).find('.helper-switch').tooltip('hide');
                },2000);
            }
        },
        /**小助手鼠标覆盖事件触发函数
         *  增加判断
         *  flag为有弹
         *  出框标志，有弹出框则小助手不拉出
         */
        _openOrCloseByMouseover : function () {
            var mouseover_flag = this.options.mouseover;
            var flag =$('body').find('.ui-dialog').length==0?true:false;
            if(flag&&mouseover_flag){
                this._openOrCloseButton();
            }
        },
    });
})();
/**
 * 图片展示组件
 *  $(element).bssimgshow(option);
 */
!function() {
	'use strict';
	
	var fileTemp = 
		'<div class="picture-upload js-file-upload-content">' + 
    		'<div class="picture-upload-cont">' + 
    			'<p class="js-file-upload-process-text">0%</p>' + 
    			'<div class="loading-box"><div class="progressbar js-file-upload-progressbar"></div></div>' + 
    			'<p>正在上传</p>' + 
    		'</div>' + 
    	'</div>' +
		'<div class="picture-upload js-file-msg">' +
			'<img class="media-object js-file-image" src="" alt="...">' +
		'</div>' + 
		'<div class="picture-upload js-file-opt">' + 
		    '<div class="picture-upload-cont">' + 
		        '<a class="picture-upload-btn js-file-down"><i class="glyphicon glyphicon-download-alt"></i><span>下载</span></a>' +
		        '<a class="picture-upload-btn js-file-del"><i class="glyphicon glyphicon-trash"></i><span>删除</span></a>' +
		    '</div>' +
		'</div>' +
	'</div>'
    ;
						 					
	$.widget("ui.bssimgshow", {
        options: {
        	name:"", //图片名称
        	imageurl:"",//图片文件路径
        	size:"",//文件大小
        	upprocess:0,//上传进度
        	downfile:$.noop,//下载文件方法
        	delfile:$.noop,//删除文件方法
        },
        _create:function(){
        	this.element.append(fileTemp);
        	
        	//图片展示界面
        	this.$fileMsg = $(".js-file-msg");
        	this.$fileImage = $(".js-file-image");
        	
        	//上传进度界面
        	this.$fileUploadContent = $(".js-file-upload-content");
        	this.$fileUploadProcessText = $(".js-file-upload-process-text");
        	this.$fileUploadProcessbar = $(".js-file-upload-progressbar");
        	
        	//上传完毕的文件操作
        	this.$fileOpt = $(".js-file-opt");
        	this.$fileDown = $(".js-file-down");//下载
        	this.$fileDel = $(".js-file-del");//删除
        	
        	//初始化progressbar
        	this.$fileUploadProcessbar.progressbar({progressbarClass: "height:1px;"});
        },
        
        //初始化
        _init:function(){
        	this._bindEvent();
        	
        	this.element.show();
        	//隐藏提示信息元素
        	this.$fileUploadContent.show();
        	this.$fileMsg.hide();
        	this.$fileOpt.hide();
        },
        
        //绑定事件
        _bindEvent:function(){
        	var that = this;
        	this._on(this.$fileMsg,{
        		"mouseenter": "_fileMsgMouseenter",
        	});
        	this._on(this.$fileOpt,{
        		"mouseleave ": "_fileMsgMouseleave"
        	});
        	
        	this._on(this.$fileDown,{
        		"click": "_downLoadFile"
        	});
        	
        	this._on(this.$fileDel,{
        		"click": "_delFile"
        	});
        },
        
        //下载文件
        _downLoadFile:function(e){
        	console.log('_downLoadFile...');
        	this._trigger("downfile", e, this.imageurl);
        },
        
        //删除文件
        _delFile:function(e){
        	console.log('_delFile...');
        	this._trigger("delfile", e, this.imageurl);
        },
        
        //鼠标移入组件事件
        _fileMsgMouseenter:function(e){
        	console.log('_fileMsgMouseenter...');
        	this.$fileMsg.hide();
        	this.$fileOpt.show();
        },
        
        //鼠标移出组件事件
        _fileMsgMouseleave:function(e){
        	console.log('_fileMsgMouseleave...');
        	this.$fileOpt.hide();
        	this.$fileMsg.show();
        },
        
        //设置图片上传进度
        setImageUploadProcess:function(process){
        	this.options.upprocess = process;
        	this.$fileUploadProcessText.text(process+"%");
        	this.$fileUploadProcessbar.progressbar("value", process)
        	console.log('setFileUploadProcess...' + process + "%");
        	
        	//当上传进度为100%时隐藏进度框
        	this.$fileUploadContent.hide();//隐藏上传进度框
        	this.$fileMsg.show();//显示图片界面
        	console.log('upload completed');
        },
        
        //设置图片位于服务器的下载地址
        setImageDownloadURL:function(imageurl){
        	this.options.imageurl = imageurl;
        	this.$fileImage.attr("src", imageurl); //设置图片路径
        },
    });
}();
  
/**
 * ip输入组件
 *  $(element).bssipinput(option);
 */
!function() {
	'use strict';

	$.widget("ui.bssipinput", {
		options : {
			// 长度最低支持110像素  
			width : 110,
			// 高度默认20像素  
			height : 20,
			// 在键盘按下时用来存储未输入前的值  
			currValue : '',
			// 原有值，就是从数据库中读取到的值  
			value : ''
		},
		_create : function() {
			this.element.hide();
			// 输入控件代码  
			var html = '<div class="input-group input-group-ip">\
							<div class="form-ip-addon">\
                				<input type="text" class="form-control ipinput_input js-ipone">\
							</div>\
							<div class="form-ip-addon">\
								<input type="text" class="form-control ipinput_input js-iptwo">\
							</div>\
							<div class="form-ip-addon">\
								<input type="text" class="form-control ipinput_input js-ipthree">\
							</div>\
							<div class="form-ip-addon">\
									<input type="text" class="form-control ipinput_input js-ipfour">\
							</div>\
						</div>';
			// 添加输入控件代码  
			this.element.after(html);
			this.$oneInput = $('.js-ipone');
			this.$twoInput = $('.js-iptwo');
			this.$threeInput = $('.js-ipthree');
			this.$fourInput = $('.js-ipfour');
		},
		_init : function() {
			var that = this;
			// 把原有的值赋到输入框中  
			if (!that._isEmpty(this.options.value)) {
				var valArr = this.options.value.split(".");
				if (4 == valArr.length) {
					that.$oneInput.val(valArr[0]);
					that.$twoInput.val(valArr[1]);
					that.$threeInput.val(valArr[2]);
					that.$fourInput.val(valArr[3]);
				}
			}
			this._bindEvent();
		},

		_bindEvent : function() {
			var that = this;
			// 输入框绑定键盘按下事件  
			$('.ipinput_input').keydown(function(event) {
				that._keydown(event);
			});

			// 输入框绑定键盘按下弹起事件  
			$('.ipinput_input').keyup(function(event) {
				that._keyup(event);
			});

			// 输入框失去焦点事件  
			$('.ipinput_input').blur(function() {
				that._setData(event);
			});

		},
		_isEmpty : function(obj) {
			return null == obj || undefined == obj || "" == obj;
		},

		// 赋值给隐藏框  
		_setData : function() {
			// 四个框的值  
			var one = this.$oneInput.val();
			var two = this.$twoInput.val();
			var three = this.$threeInput.val();
			var four = this.$fourInput.val();

			// 如果四个框都有值则赋值给隐藏框  
			if (!this._isEmpty(one) && !this._isEmpty(two)
					&& !this._isEmpty(three) && !this._isEmpty(four)) {
				var ip = one + "." + two + "." + three + "." + four;
				this.element.val(ip);
			}
		},

		// 键盘按下事件  
		_keydown : function(event) {
			var that = this;
			var $target = $(event.target);
			// 当前输入框的值  
			var value = $(event.target).val();
			// 当前输入的键盘值  
			var code = event.keyCode;
			// 除了数字键、删除键、小数点之外全部不允许输入  
			if ((code < 48 && 8 != code && 37 != code && 39 != code)
					|| (code > 57 && code < 96)
					|| (code > 105 && 110 != code && 190 != code)) {
				return false;
			}
			// 先存储输入前的值，用于键盘弹起时判断值是否正确  
			that.options.currValue = value;
			// 110、190代表键盘上的两个点  
			if (110 == code || 190 == code) {
				if(!isEmpty(value)){
					if($target.hasClass("js-ipone")){
						that.$twoInput.focus();
						return false;
					}
					
					if($target.hasClass("js-iptwo")){
						that.$threeInput.focus();
						return false;
					}
					
					if($target.hasClass("js-ipthree")){
						that.$fourInput.focus();
						return false;
					}
					
					if($target.hasClass("js-ipfour")){
						return false;
					}
				}
			}
		},

		// 键盘弹起事件  
		_keyup : function(event) {
			var that = this;
			// 当前值  
			var $target = $(event.target);
			var value = $target.val();
			if (!this._isEmpty(value)) {
				if($.isNumeric(value)){
					value = parseInt(value);
					
					if (value > 255) {
						$target.val(this.options.currValue)
					} else if (value > 99) {
						// 当前输入框的ID  
						if($target.hasClass("js-ipone")){
							that.$twoInput.focus();
							return false;
						}
						
						if($target.hasClass("js-iptwo")){
							that.$threeInput.focus();
							return false;
						}
						
						if($target.hasClass("js-ipthree")){
							that.$fourInput.focus();
							return false;
						}
						
						if($target.hasClass("js-ipfour")){
							return false;
						}
					}
					
					
				}else{
					$target.val("");
					return false;
				}
			}
		}
		
		
	});

}();

/**
 * 菜单导航控件
 * $().menunav(options);
 */
!function(){
	'use strict';
	
	$.widget('ui.bssmenunav',{
		options:{
			scrollThreshold:0.1,    //滚动检测阀值 0.1在浏览器窗口中间部位
            scrollSpeed:700,        //滚动到指定位置的动画时间
            scrollTopBorder:500,    //滚动条距离顶部多少的时候显示导航，如果为0，则一直显示
            easing: 'swing',        //不解释
            delayDetection:100,     //延时检测，避免滚动的时候检测过于频繁
            navwinArr: [],          //滚动窗口中的导航列表
            scrollChange:function(){} //滚动的时候回调函数
		},
		_init:function(){
			var options = this.options;
			if(!options.navWin && !options.navwinArr){
				console.error('menunav cannot init！please check');
			}else{
				this.$win = options.targetWin ? options.targetWin : $(window) ; //滚动的窗口（右侧）
		        this.$h = options.navwinArr; //滚动窗口中页面列表
		        this.$pageNavList = options.navWin; //导航条窗口(左侧)
		        this.rendViewFuc = options.rendview || $.noop;
		        this.$pageNavListLis ="";
		        this.$pageNavListLiH = "";
		        this.curIndex = 0;
		        this.scrollIng = false;
		        this._make();
		        this._bindEvent();
		        this._scollToIndex(0,false);
			}
		},
		/**
		 * 构建左侧滚动条目
		 */
		_make:function(){
	 		var NavHtml = '<div class="step-heading"></div>\
					 			<div class="step-operation">\
					 				<div class="step-search-bar">\
					 					<input type="text" class="search-form-control js-search-input">\
					 				</div>\
					 				<div class="step-search-tabs">\
					 					<ul class="row">\
		 									<li class="col-xs-6 text-left"><i class="icon-state-dot state-normal margin-right-sm"></i>已配置</li>\
											<li class="col-xs-6 text-right text-muted"><i class="icon-state-dot margin-right-sm"></i>未配置</li>\
					 					</ul>\
					 				</div>\
					 			</div>\
					 		<div class="step-list"><ul class="js-step"></ul></div>\
	 						<div class="step-foot js-custom-operation"">\
	 							<a href="javascript:void(0);" class="js-custom-link">自定义展示</a>\
	 							<a href="javascript:void(0);" class="js-custom-confirm">保存</a>\
	 							<a href="javascript:void(0);" class="js-custom-cancel margin-horizontal-lg">取消</a>\
	 						</div>';
	 		
	 		this.$pageNavList.append(NavHtml);
	 		this.$pageNavTitle = this.$pageNavList.find(".step-heading");
	 		this.$pageNavTitle.html(this.options.winTitle);
	 		this.$searchInput = this.$pageNavList.find("input.js-search-input");
	 		
	 		//自定义展示链接
	 		this.$customLink = this.$pageNavList.find(".js-custom-link");//“自定义展示”标签
	 		this.$customOperationPanel = this.$pageNavList.find(".js-custom-operation");//控制自定义展示的“确认”“取消”面板
	 		this.$customOperationConfirmBtn = this.$pageNavList.find(".js-custom-confirm");//保存自定义展示的“确认”按钮
	 		this.$customOperationCancelBtn = this.$pageNavList.find(".js-custom-cancel");//取消保存自定义展示的“取消”按钮
	 		
	 		var This = this;
            var $hs = This.$h,
                temp = [];
            var titleList = [];
            fish.each($hs,function(hs,index){
            	var text = hs.title;
            	titleList.push(text);
            	var state = hs.state || 'warning';
            	var stateClass = '';
            	if (state == 'warning') {
            		stateClass = 'state-muted';
            	}
            	temp.push('<li class="step-item '+stateClass+'"> \
            			<div class="step-item-cont">\
            			<input type="checkbox" class="step-item-checkbox">\
            			'+text+'</div> </li>');
                This._rendView(index);
            });
            

	 		//搜索框设置为自动完成
	 		this.$searchInput.autocomplete({
	 			source: titleList,
	 			select: function (e, item) {
	 				if (item.item !== undefined) {
	 					This._search(item.item.value);
	 				} else {
	 					This._search('');
	 				}
	 			}
	 		});
            
            this.$pageNavList.find("ul.js-step").html(temp.join(""));
            //设置变量
            this.$pageNavListLis = this.$pageNavList.find("ul.js-step>li");
            this.$pageNavListLiH = this.$pageNavListLis.eq(0).height();
            this.$pageNavList.show();
            
            //添加li元素后立即将对应的checkbox隐藏
        	this.$pageNavListLis.each(function(index){
    			var $this = $(this); //$this指向li标签
    			var $checkbox = $this.find("div.step-item-cont>input.step-item-checkbox");
    			$checkbox.hide();//隐藏每个li元素的checkbox
    		});
            
            //将导航栏固定
            //var $pageNavListDIV = this.$pageNavList.find(".directory-main");
            this.$pageNavList.css('position','fixed');
           // $pageNavListDIV.css('width',this.$pageNavList.width());
            
            //$pageNavListDIV.css('top',this.$pageNavList.offset().top);
            //$pageNavListDIV.css('left',this.$pageNavList.offset().left);
            
            //在进入自定义模式前隐藏“确认”“取消”按钮
            this._toggleCustomControlBtn("hide");
            
        },
        
        /**
         * 设置导航栏状态
         * @param index
         * @param state
         */
        setState:function(index,state){
        	index+=1;
        	var $li = this.$pageNavList.find("ul.js-step li:nth-child("+index+")");
        	$li.removeClass("state-muted");
        	if (state == "warning") {
        		$li.addClass("state-muted");
        	}
        	
        	//$li.removeClass("state-warning");
        	//$li.removeClass("state-danger");
        	//$li.addClass("state-"+state);
        },
        preWin:function(){
        	if(this.curIndex == 0) return false;
        	var index = this.curIndex -1;
        	this._scollToIndex(index,true);
        },
        nextWin:function(){
        	if(this.curIndex == this.$h.length ) return false;
        	var index = this.curIndex + 1;
        	this._scollToIndex(index,true);
        },
        _bindEvent:function(){
            var This = this,
                show = false,
                timer = 0;
            this.$win.on("scroll", "", This, This._scrollEventHandler); //第三个参数This为当前view上下文
            															//提供handler函数内部使用该This调用view局部变量

            this.$pageNavList.on("click","ul.js-step>li",function(e){
                var $this = $(this),
                    index = $this.index();
                var scorll = false;
                if(!This.$h[index].hasInitView && This.$h[index].viewArr){
                	scorll = true;
      		  	}else{
      		  		scorll = This.$h[index].win[0].offsetHeight > 0;
      		  	}
                This._scollToIndex(index,scorll);
                This._trigger('navclick',e,index);
            });
            

            //设置搜索框的回车点击事件
            this.$searchInput.on('keypress', function(event){
                if(event.keyCode == 13)
                {  
                	var s_key = This.$searchInput.val();
                	This._search(s_key);
                }
            });
            
            
            //“自定义展示”链接
            this.$customLink.on("click", function () {
            	This._customNav();
            });
            
            //“确认”按钮
            this.$customOperationConfirmBtn.on("click", function () {
            	This._saveCustomStatus();
            });
            
            //“取消”按钮
            this.$customOperationCancelBtn.on("click", function () {
            	This._cancelCustomStatus();
            });
        },
        
        // window scroll事件绑定函数
        _scrollEventHandler:function(event){
        	var This = event.data;  //从data中获取绑定事件时传入的上下文参数
        							//this指向window，This指向当前view
        	var timer = 0;
        	This.$searchInput.autocomplete("close");
        	This.$searchInput.blur();
            var $this = $(window);
            clearTimeout(timer);
            timer = setTimeout(function(e){
                This.scrollIng = true;
                
                //判断滚动条是否滚到底了
                This.scrollToBottom = $this.scrollTop()+1 + $this.height()  >= $(document).height();
                //console.log("scrollToBottom..:"+$this.scrollTop()+"+"+$this.height()+">="+$(document).height()+"="+This.scrollToBottom);
                //加载未加载视图
                if(This.scrollToBottom){
                	
                	// 修复当滑动到底部时无法定位至最后一个win的问题
                	if ((This.$h[This.$h.length - 2].win[0].offsetTop <= $this.scrollTop()+1) && 
                		!$(This.$h[This.$h.length - 1].win[0]).is(":hidden")) {
                		This._scollToIndex(This.$h.length - 1,false);
                	}
                	
                	  for(var i=0;i<This.$h.length;i++){
                		  if(!This.$h[i].hasInitView && This.$h[i].viewArr){
                			  This._scollToIndex(i,true);
                          	  break;
                		  }
                      }
                }else{
                	 for(var i=This.$h.length-1;i>=0;i--){
                         if(This.$h[i].win[0].offsetTop <= $this.scrollTop()+1){ //第i个DIV滚动到了顶部
                         	//This._trigger('scrollchange',e,$this.	());
                        	 
                        	 if (!$(This.$h[i].win[0]).is(":hidden")) {
                        		 // 当win被隐藏时 This.$h[i].win[0].offsetTop 值为0，满足上面if条件
                        		 // 禁止导航到隐藏窗口
                        		 	This._scollToIndex(i,false);
                              		break;
                        	 }
                         }
                     }
                }
            },This.options.delayDetection);
        },
        
        _scollToIndex:function(index,scroll){
        	this.curIndex = index;
        	var $curLi = this.$pageNavListLis.eq(index);
        	$curLi.addClass("active").siblings("li").removeClass("active");
        	this._posTag(index);
        	
        	if(scroll) this._scrollTo(index);
        },
        
        _scrollTo: function(index) {
            var This = this;
            
            //渲染未渲染视图
            This.$h[index].initView = true;
            This._rendView(index);
            //var offset = This.$h[index].win.offset().top;
           
//            this.$win.animate({
//                "scrollTop": offset
//            }, this.options.scrollSpeed, this.options.easing, function(){
//                This.scrollIng = false;
//            });
            
            var offset = This.$h[index].win[0].offsetTop;
            $("html,body").animate({
                "scrollTop": offset
            }, this.options.scrollSpeed, this.options.easing, function(){
                This.scrollIng = false;
            });
            
        },
        _posTag:function(index){
            var $curDiv = $(this.$h[index].win);
        	$(".ppm-panel-activated").removeClass("ppm-panel-activated");
        	$($curDiv.find(".ppm-panel")[0]).addClass("ppm-panel-activated");
        	
        },
        _rendView:function(index){
        	var This = this;
        	var hs = This.$h[index];
        	if(hs.hasInitView) return false;
        	var initView = hs.initView;
            if(initView){
            	fish.each(hs.viewArr,function(view){
            		var view_name = view.view_name;
                 	This.rendViewFuc(view_name);
                 	hs.hasInitView = true;
            	});
            }
        },
        
        removeThisScrollEvent: function () {
        	this.$win.off("scroll", this._scrollEventHandler);
        },
        
        //搜索框执行的搜索方法
        _search: function (value) {
        	var This = this;
        	if(value === ''){
        		This._scollToIndex(0,true); 
	       	}else{ //遍历搜索
	       		this.$pageNavListLis.each(function(index){
	       			var $this = $(this);
	       			var litext = $this.find("div").text();
	       			if( litext.indexOf(value) !=-1){ //搜索到了
	       				This._scollToIndex(index,true); 
	       				 return false;
	       			}
	       		});
	       	}
        },
        
        //自定义展示
        _customNav: function () {
        	if (this.hasEnterCustomLink){
        		console.log("退出自定义状态");
        		this.$customLink.text("自定义展示");
        		var hs = this.$h;//保存从全局this中获取的右侧窗口列表
        		//取消所有checkbox的选中状态并回复所有li元素显示
            	this.$pageNavListLis.each(function(index){
        			var $li = $(this);
        			$li.show();
        			var $checkbox = $li.find("div.step-item-cont>input.step-item-checkbox");
        			$checkbox.attr("checked", false);
        			$checkbox.hide();
        			$(hs[index].win[0]).show();//回复右侧index对应win
        		});
        		this.hasEnterCustomLink = false;
        		this.$customLink.show();
        		this._toggleCustomControlBtn("hide");//隐藏“确认”“取消”按钮
        	} else {
        		console.log("进入自定义展示状态");
        		this.$customLink.text("回复默认展示");
        		this.hasEnterCustomLink = true;
        		this._toggleCustomControlBtn("show");//显示“确认”“取消”按钮
        		this.$customLink.hide();
        		//显示checkbox
            	this.$pageNavListLis.each(function(index){
        			var $li = $(this);
        			var $checkbox = $li.find("div.step-item-cont>input.step-item-checkbox");
        			$checkbox.show();
        		});
        	}
        },
        
        //保存自定义展示修改状态
        _saveCustomStatus: function () {
        	console.log("保存自定义展示状态");
        	var hs = this.$h;//保存从全局this中获取的右侧窗口列表，防止进入each后this无法获取
        	//遍历ul数组查找是否有checked状态的checkbox
        	this.$pageNavListLis.each(function(index){
    			var $li = $(this);
    			var $checkbox = $li.find("div.step-item-cont>input.step-item-checkbox");
    			if (!$checkbox.is(':checked')){
    				//该checkbox没有选中，隐藏对应li
    				$checkbox.parent().parent().hide();
    				$(hs[index].win[0]).hide();//隐藏右侧index对应win
    			}
    			$checkbox.hide();//隐藏每个li元素的checkbox
    		});
        	this._toggleCustomControlBtn("hide");//隐藏“确认”“取消”按钮
        	this.$customLink.show();
        },
        
      //取消自定义展示修改状态
        _cancelCustomStatus: function () {
        	console.log("取消自定义展示状态");
    		this.$customLink.text("自定义展示");
        	//取消所有checkbox的选中状态并回复所有li元素显示
        	this.$pageNavListLis.each(function(index){
    			var $li = $(this);
    			$li.show();
    			var $checkbox = $li.find("div.step-item-cont>input.step-item-checkbox");
    			$checkbox.attr("checked", false);
    			$checkbox.hide();
    		});
        	this.hasEnterCustomLink = false;
        	//隐藏“确认”“取消”按钮
        	this._toggleCustomControlBtn("hide");
        	this.$customLink.show();
        },
        
        // 切换自定义模式中“确认”“取消”按钮的状态
        // status："hide"为隐藏按钮，"show"为显示按钮
        _toggleCustomControlBtn: function (status) {
        	if (status === "hide") {
        		this.$customOperationConfirmBtn.hide();
                this.$customOperationCancelBtn.hide();
        	} else if (status === "show") {
        		this.$customOperationConfirmBtn.show();
                this.$customOperationCancelBtn.show();
        	}
        }
	});
}();
/**
 * 推拉门组件
 * $(element).slidingdoor(option);
 */
!function() {
	'use strict';

	$.widget("ui.slidingdoor", {
		options : {
			// 需要显示在组件的视图对象
			viewUrl: '',
			viewOptions:{},
			// 初始化时是否立即隐藏组件，true为立即隐藏
			// 同时读取该属性可获取当前组件的显示状态
			hidingView: true,
			renderData:$.noop,
			// 在sliding-panel这个div上增加自定义DOM类名
			elemClass: '' 
		},
		_create : function() {
			var This = this;
			
			// 生成不重复的ID
			if (!$.ui.slidingdoor.prototype.instanceCount) {
				$.ui.slidingdoor.prototype.instanceCount = 0;
			}
			$.ui.slidingdoor.prototype.instanceCount++;
			This.elemID = "slidingDoor" + $.ui.slidingdoor.prototype.instanceCount;
			
			var html = '<div id="' + This.elemID + '" class="slidingDoor js-slidingDoorDiv">\
							<div class="sliding-panel">\
							<div class="sliding-panel-main js-slidingDoor-content"></div>\
							</div>\
						</div>';
			
			$("body").append(html);
			This.$slidingDoor = $("#"+This.elemID);
			This.$slidingDoorPanel = This.$slidingDoor.find(".sliding-panel");
			This.$slidingDoorC = This.$slidingDoor.find(".js-slidingDoor-content");
			
			if (This.options.elemClass) {
				This.$slidingDoorPanel.addClass(This.options.elemClass);
			}
			
			if(this.options.viewUrl !=''){
				// 读取传入的视图对象
				require([this.options.viewUrl],function(SubView){
					var subView = new SubView($.extend({}, This.options.viewOptions));
					subView.render();
					This.subView = subView;
					This.$slidingDoorC.append(subView.$el);
				});
				
				
				
			}
			
		},
		
		// 初始化组件
		_init : function() {
			var that = this;
			that.hasBidingBodyEvent = false; //判断当前body是否绑定点击事件
			that.eventLock = false; //事件锁，为true则阻止body事件的执行
			that.hasExit = false;
			this.$slidingDoor.hide(); 	//初始化时立即将组件隐藏（包括动画）
										//防止初始化完成后当hidingView为true时
										//马上闪现右划隐藏的动画
			this.$slidingDoor.css({
				right: "-100%"
			});
			
			if (!that.options.hidingView) {
				that._show(true);
			}
			this._bindEvent();
		},
		
		// 绑定组件事件
		_bindEvent : function() {
			var that = this;
			that.element.click(function () {
				if (!that.hasExit) {
					that.options.renderData(that.subView);
					that.show();
					that.hasExit=true;
				} else {
					that.hide();
					that.hasExit=false;
				}
			});
			
		},
		
		// 销毁该组件
		_destroy:function(){
			var that = this;
			$("body").off('click', that._bodyEvent);
			that.$slidingDoor.remove();
			that._super();
		},
		
		// 切换组件的显示状态
		// status：组件状态，“show”为切换成显示，“hide”为隐藏
		_toggleStatus: function (status) {
			var that = this;
			if (status == "show") {
				that.$slidingDoor.show();
				that.$slidingDoor.animate({
					right: "0"
                }, function () {
                	
                });
				that.hasExit = true;
			} else if (status == "hide") {
				that.$slidingDoor.animate({
                	right: "-100%"
                }, function () {
                	that.$slidingDoor.hide();
                });
				that.hasExit = false;
        	};
		},
		
		// 显示组件
		show: function () {
			this._show();
		},
		
		_show: function (noLock) {
			var that = this;
			if (noLock) {
				that.eventLock = false; //绑定事件后马上执行事件
			} else {
				that.eventLock = true; //锁定body点击事件，防止点击按钮后马上执行事件处理
			}
			
			if(!that.hasBidingBodyEvent){
				$("body").on('click', '', that, that._bodyEvent);
				that.hasBidingBodyEvent = true;
			}
			that._toggleStatus("show");
		},
		
		// 隐藏组件
		hide: function () {
			var that = this;
			if(that.hasBidingBodyEvent){
				$("body").off('click', that._bodyEvent);
				that.hasBidingBodyEvent = false;
			}
			that._toggleStatus("hide");
		},
		
		// body绑定点击事件
		// 点击body任意位置（不包括组件及其内部元素）时隐藏组件
		_bodyEvent: function (e) {
			var that = e.data;
			if (that.eventLock){
				that.eventLock = false;
				return false;
			}
			if (that.hasExit && 
				that.hasBidingBodyEvent && $('body').find('.ui-dialog').length==0&&  // $('body').find('.ui-dialog').length==0 判断页面没有弹出框存在
				$(e.target).parents('.js-slidingDoorDiv').length == 0 && !$(e.target).hasClass("js-slidingDoorDiv")) {
				if(e.target.className != 'glyphicon glyphicon-remove'){  //判断事件源是否为弹出窗的关闭按钮
					that.hide();
				}
			}
		}
		
	});

}();

/*
 * 水平流程时间轴
 * */
(function() {
    "use strict";
    //左按钮
    var left_btn_template = '<div class="left" style="display: none;">\
        <button btn="left" type="button" class="btn btn-default">\
        <span class="glyphicon glyphicon-menu-left"></span>\
        </button>\
        </div>';

    //右按钮
    var right_btn_template = '<div class="right" style="display: none;">\
        <button btn="right" type="button" class="btn btn-default">\
        <span class="glyphicon glyphicon-menu-right"></span>\
        </button>\
        </div>';

    //时间轴的内容框
    var step_content = '<div class="step-cont"></div>';
    var ul_element = '<ul class="row clearfix"></ul>';

    //每个流程item
    var step_item = '<li class="col-md-2 col-sm-4">\
        <i class="step-mid-line"></i>\
        <div class="step-dot-cont"><span class="step-dot"><i class="glyphicon glyphicon-ok"></i></span></div>\
        <div class="step-title"></div>\
        <div class="step-time"></div>\
        </li>';
    $.widget('ui.bsstimestep', {
        options: {
            dataSource: [] //传入参数
        },
        /*
        * 监听屏幕变化
        * */
        _resize : function () {
            /*//ul的宽度
            var ul_width = $(this.element.find('.row')).outerWidth();
            //li的宽度
            var li_width = $(this.element.find('.row li')).outerWidth();*/
            //显示的个数
            // var display_count = Math.round(ul_width / li_width);
            // this.display_count = display_count;
            var window_width = $(window).outerWidth();
            if(window_width >= 992){
                this.display_count = 6;
            } else if(window_width >= 768){
                this.display_count = 3;
            } else if(window_width < 768){
                this.display_count = 1;
            }
            // console.log("display_count:" + display_count);
            var that = this;
            $(window).resize(function (event) {
               // ul_width = $(that.element.find('.row')).outerWidth();
                // li_width = $(that.element.find('.row li')).outerWidth();//这里监听的li的宽度是不准的
                // display_count = Math.round(ul_width / li_width);
                var window_width = $(window).outerWidth();
                if(window_width >= 992){
                    that.display_count = 6;
                } else if(window_width >= 768){
                    that.display_count = 3;
                } else if(window_width < 768){
                    that.display_count = 1;
                }
                // that.display_count = display_count;
                //屏幕变化就再执行
                that._handle();
                // console.log("display_count:" + display_count);
            });
            this._handle();
        },
        _handle : function () {
            var options = this.options;
            var display_count = this.display_count;
            //当流程个数大于可显示数时，显示左右按钮
            if(this.dataLength > this.display_count){
                $(this.element.find(".left")[0]).show();
                $(this.element.find(".right")[0]).show();
            }
            //将所有li显示；用于窗口变化时，初始化原来的init显示的状态
            $(this.element.find("li")).show();
            for (var i = 0; i < this.dataLength; i++) {
                //把大于6且还没有审批的流程隐藏
                if (i >= display_count && options.dataSource[i].pass === false) {
                    // $($(ul_element).find("li")[i]).hide();
                    $(this.element.find("li")[i]).hide();
                }

                //把大于6且通过审批的流程显示相差6个item的那个item隐藏
                if (i >= display_count && options.dataSource[i].pass === true) {
                    // $($(ul_element).find("li")[i]).show();
                    // $($(ul_element).find("li")[i - display_count]).hide();

                    $(this.element.find("li")[i]).show();
                    $(this.element.find("li")[i - display_count]).hide();
                }
                //把大于6且通过审批的流程的前一个为审批的显示出来
                /*if(i >= display_count && options.dataSource[i].pass === true && !options.dataSource[i+1].pass){
                    $(this.element.find("li")[i+1]).show();
                    $(this.element.find("li")[i - display_count + 1]).hide();
                }*/
            }
            var pass_count = this.element.find(".pass").length;
            if(pass_count != 0 && pass_count != this.dataLength){
                $(this.element.find("li")[pass_count -1 + 1]).show();
                $(this.element.find("li")[pass_count -1 + 1 - display_count ]).hide();
            }
        },
        _create: function() {
            this.inita();
            this._resize();
            this._delegateEvent();
        },
        inita: function() {
            var display_count = this.display_count;

            var options = this.options;
            //流程的个数
            this.dataLength = 0;
            if (options.dataSource && options.dataSource.length > 0) {
                this.dataLength = options.dataSource.length;
            }

            // if(dataLength > 6){
                //添加左边按钮
                this.element.append(left_btn_template);
            // }

            //渲染时间轴
            for (var i = 0; i < this.dataLength; i++) {

                if (typeof options.dataSource[i].pass !== "boolean") {
                    fish.error('pass 参数传递不是 boolean类型');
                    return;
                }
                if (typeof options.dataSource[i].name !== "string") {
                    fish.error('name 参数传递不是 string类型');
                    return;
                }
                if (typeof options.dataSource[i].time !== "string") {
                    fish.error('time 参数传递不是 string类型');
                    return;
                }

                //添加每个流程item
                ul_element = $(ul_element).append(step_item);
                //添加每个流程item的名称和时间
                $($(ul_element).find(".step-title")[i]).text(options.dataSource[i].name);
                $($(ul_element).find(".step-time")[i]).text(options.dataSource[i].time);

                //添加审批通过样式
                if (options.dataSource[i].pass === true) {
                    $($(ul_element).find("li")[i]).addClass("pass");
                }
                /*
                //把大于6且还没有审批的流程隐藏
                if (i >= display_count && options.dataSource[i].pass === false) {
                    $($(ul_element).find("li")[i]).hide();
                }

                //把大于6且通过审批的流程显示相差6个item的那个item隐藏
                if (i >= display_count && options.dataSource[i].pass === true) {
                    $($(ul_element).find("li")[i]).show();
                    $($(ul_element).find("li")[i - 6]).hide();
                }
                */
            }

            //为第一个和最后一个item添加识别的class
            $($(ul_element).find("li")[0]).addClass("first-line");
            $($(ul_element).find("li")[this.dataLength - 1]).addClass("last-line");

            step_content = $(step_content).append(ul_element);
            this.element.append(step_content);
            step_content = '<div class="step-cont"></div>';
            ul_element = '<ul class="row clearfix"></ul>';

            // if(dataLength > 6){
                //添加右边按钮
                this.element.append(right_btn_template);
            // }
        },
        _delegateEvent: function() {
            var me = this;
            var options = me.options;
            //事件监听
            this._on({
                'click [btn="left"]': '_leftButton'
            });
            this._on({
                'click [btn="right"]': '_rightButton'
            })
            this._bindItemEvent();
        },
        _bindItemEvent: function() {
            var me = this;
            var options = me.options;
            var step_elements = $(this.element).find('li .step-dot-cont');
            for (var i = 0, j = step_elements.length; i < j; i++) {
                (function(num) {
                    $(step_elements[num]).on('click', function(event) {
                        //注册事件回调的方法名需要全小写，不然外面调用会监听不到
                        me._trigger("clickitem", event, options.dataSource[num]);
                        return false;
                    });
                })(i);
            }
        },
        /**
         * 选中流程事件
         * param data 选中的数据
         * param event 事件对象
         * */
        /*clickItem : function (event,data) {

        },*/
        //左边按钮：隐藏最右边的时间进度div
        _leftButton: function() {
            // fish.info("test left button");
            var me = this;
            var options = me.options;
            //流程的个数
            var dataLength = 0;
            if (options.dataSource && options.dataSource.length > 0) {
                dataLength = options.dataSource.length;
            }
            //找出第一个显示的div
            var step_dom = this.element.find("li");
            for (var i = 0, j = step_dom.length; i < j; i++) {
                //最左边已经是显示了；
                if (i == 0 && $(step_dom[i]).css("display") == "list-item") {
                    fish.info('已移到最前');
                    break;
                }
                if ($(step_dom[i]).css("display") == "list-item") {
                    $(step_dom[i - 1]).show();
                    // $(step_dom[i + 5]).hide();
                    $(step_dom[i + (this.display_count - 1)]).hide();
                }
            }
        },

        //右边按钮：隐藏最左边的时间进度div
        _rightButton: function() {
            // fish.info("test right button");
            var me = this;
            var options = me.options;
            //流程的个数
            var dataLength = 0;
            if (options.dataSource && options.dataSource.length > 0) {
                dataLength = options.dataSource.length;
            }
            //找出第一个显示的div
            //步骤文字div
            var step_dom = this.element.find("li");
            //时间节点div
            for (var i = step_dom.length - 1, j = 0; i > j; i--) {
                //最右边已经是显示了；
                if (i == dataLength - 1 && $(step_dom[i]).css("display") == "list-item") {
                    fish.info('已移到最后');
                    break;
                }
                if ($(step_dom[i]).css("display") == "list-item") {
                    $(step_dom[i + 1]).show();
                    $(step_dom[i - (this.display_count - 1)]).hide();
                }
            }
        },
        /**
         * 重新加载数据
         * param datas 数据组
         * */
        reloadData: function(datas) {
            var that = this;
            this.element.empty();
            this.options.dataSource = datas;
            that.inita();
            that._resize();
        }
    });
})();
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
/**
 * combobox.js扩展,支持配置attr_code以及级联功能
 */
!function(){
	"use strict";
	var MENU_ITEM = '<li></li>';

	$.widget('ui.combobox',$.ui.combobox,{
		options:{
			web_root:null,
			attr_code: null,
			parent_dom: null,
			showall:false, //是否增加一个全部选择
			url:null,
			sub_data:'default',  //对于级联下拉框，子下拉框的数据来源。 default: 由attr_code自己去获取  ，parent:开始为空，当父下拉框改变的时候触发url查询
			tcEvent:true,
            showNullItem: false, //将fish默认打开的下拉项为空时显示“---请选择---”提示语选项关闭
            placeholder: "" // 将fish默认打开的在placeholder上显示“---请选择---”提示语选项关闭
		},
		_init: function(){
			var that = this;
			

			if(that.options.attr_code && !that.options.web_root){
				console.error('combobox cannot init！please check');
				return false;
			}

			that._qryUrl = "";
			if(that.options.url == null){
				that._qryUrl = that.options.web_root+"/StaticDataController/getStaticAttr.do";
			}else{
                that._qryUrl = that.options.url;
            }

			that.options.attr_code = that.options.attr_code || that.element.attr('data-attr-code');
			that.options.parent_dom = that.options.parent_dom || that.element.attr('data-parent-dom');

			var defer = $.Deferred();
			if(that.options.attr_code){
				that._initWidget(that.options.attr_code,defer);
			}else{
				defer.resolve();
			}

			 //执行父类方法
			defer.promise().then(function(){ //then全是父类 _init()   方法 _super()调通报错
				that._superInit();
			});
		},
		
		_superInit:function(){
			var that = this;
			that.shown = false;
            // 处理dataTextField的值为非字符串的问题
            if (that.options.dataSource && that.options.dataSource.length) {
                $.each(that.options.dataSource, function(i, item) {
                    item[that.options.dataTextField] += "";
                });
            }

            // 当value初值为dataSource对象元素下标时将该value转化为DataSource内对应下标元素的value字符串
            // 可支持传入value下标自动转化为下标对应value值的功能
            // 当value为非数字或不在dataSource元素范围内时跳过该转换
            if ( _.isNumber(that.options.indexValue )
                	&& (that.options.dataSource.length > that.options.indexValue)
                	&& (that.options.indexValue >= 0)) {
	            	that.options.value = (that.options.dataSource[that.options.indexValue])[that.options.dataValueField];
            }

            if(that.options.showall &&  JSON.stringify(that.options.dataSource).indexOf(JSON.stringify({'name':'全部','value':'-1'})) == -1 ){ //显示全部
            	that.options.dataSource.unshift({'name':'全部','value':'-1'});
            }

            // 处理浏览器对select的默认行为
            if (!that.element.is('select') || that.element.find("option:selected").attr("selected")) {
                // issue 789
            	that.value(that.options.value === null ? that.element.val() : that.options.value);
            } else {
            	that._select(null);
            }
		},

		_initDataSource:function(params,defer){
			var that = this;
			var attr_code = "";
			if(fish.isObject(params)){
				attr_code = params.attr_code;
			}else{
				attr_code = params;
			}
			
			if(attr_code === null || attr_code === "" ){
				return false;
			}else{
				if(!fish._codecache){
					fish._codecache = {};
				}
				//本地对象缓存，减少请求数量
				if(!fish.isObject(params) && fish._codecache[attr_code]){
					//如果有缓存就直接从缓存中取
					that.loadData = true;
					that.options.dataSource = fish._codecache[attr_code];
					if(defer) {
						defer.resolve();
					}else{
						that._superInit();
					}
				}else{
					//否则请求服务端
					fish.post(that._qryUrl,params).then(function(reply){
							fish.each(reply, function(obj){
								   obj.name = obj.attrValueDesc;
								   obj.value = obj.attrValue;
								   // obj.attrValueId  本级节点  用于上下级关系
								   // obj.parentValueId 父级节点  用于上下级关系
							});
							that.loadData = true;
							that.options.dataSource = reply;
							fish._codecache[attr_code] = reply;

							//如果该私有变量有值，说明是之前在未加载完毕时预约的，重新赋值
							if(that._asyncvalue){
								that.value(that._asyncvalue);
								that._asyncvalue = null;
							}

							if(defer) {
								defer.resolve();
							}else{
								that._superInit();
							}
					});
				}
			}
		},
		_initWidget:function(attr_code,defer){
			var that = this;
            if(that.options.sub_data === 'default')
			that._initDataSource(attr_code,defer);

			if(that.options.parent_dom){
				var dom = that.options.parent_dom;
				if(typeof dom === "string"){
					dom = $(dom);
				}
				var p_attrValue = dom.combobox("value");
				//需要根据 attrValue 找到对应的 attrValueId
				if(p_attrValue !== null)
				that._parentChange(dom.combobox("getAttrValueId",p_attrValue));

				//对选择的目标监听事件，默认认为也是combobox
				dom.on('combobox:change',function(e){
					var p_attrValue = dom.combobox("value");
					that._parentChange(dom.combobox("getAttrValueId",p_attrValue));
				});
			}
		},
		/**
		 * 根据 attrValue 找到对应的 attrValueId
		 * @param attrValue
		 * @returns {String}
		 */
		getAttrValueId:function(attrValue){
			var that = this;
			var attrValueId = "";
			$.each(that.options.dataSource, function(i, item) {
				if(item.value == attrValue){
					attrValueId = item.attrValueId;
					return false;
				}
			});
			return attrValueId === "" ? attrValue : attrValueId;
		},
		_parentChange:function(p_attrValue){
			var that = this;
			that.p_attr_value = p_attrValue;
			if(that.options.sub_data === 'parent'){
				that.options.dataSource.splice(0,that.options.dataSource.length);
				that._initDataSource({"attr_code":that.options.attr_code,"parentValue":that.p_attr_value});
			}else{
				that._setDefaultText();
			}
			that._trigger('parentchange',that.p_attr_value);
		},

		_setDefaultText:function(){
			var that = this;
			var noText = true;
			
			$.each(that.options.dataSource, function(i, item) {
				if( (!that.p_attr_value && that.p_attr_value != "") || item.attrValue === '-1' || that.p_attr_value === item.parentValueId){
					that.value(item[that.options.dataValueField]);
					noText = false;
					return false;
				}

            });
				
			if(noText){
				that.value("");
			}
		},

		render: function render(items, query) {
            var that = this;

            items = $(items).map(function (i, item) {

            	if(that.options.sub_data === 'parent' || !that.p_attr_value || that.p_attr_value === item.parentValueId || item.attrValue === "-1"){
            		 i = $(MENU_ITEM).data('value', item).attr('title', item[that.options.dataTextField]);
                     i.html(that.highlighter(item[that.options.dataTextField], query));
                     return i[0];
            	}
            });

            items.first().addClass('active');
            this.$menu.html(items);
            return this;
        },
        /**
        重写value方法以处理异步情况
         */
        value: function (value) {
            var options = this.options,
                that = this;
            if(value && options.attr_code && !that.loadData){
            	//配置了attr_code的下拉框还没初始化完，则将预备要初始化的值放置于私有变量中
            	that._asyncvalue = value;
        	}
        	return this._super(value);
        },
        
        _triggerChange: function () {
        	if(this.options.tcEvent){
        		 this._trigger('change');
        		 this.options.tcEvent = true;
        	}
        	
           
        },
	});
}();
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
//IE9兼容使用，避免因缺乏console对象导致的脚本报错

(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
})();
!function(){
	"use strict";
	
	/**
	 * 浮动盒子组件
	 */
	var fixed_list = [];
	var fixed_id = 0;
	
	$.widget('ui.fixedbox',{
		options:{
			placement: 'left',//备用参数，放置的相对位置 right
			trigger:'click',//触发方式，可配置为hover或click
			width: 'auto',//宽度参数，默认自动，可手动调整，目前没有效果
			content: "浮动盒子内容",//内容，接受HTML字符串或jquery对象
			template: '<div class="fixedBox" role="fixedBox"></div>',
			show:$.noop,//浮动盒子展示时的回调函数
			hide:$.noop,//浮动盒子隐藏时的回调函数
			init:$.noop
		},
		_init:function(){
			var that = this;
			var fixedbox_id = fixed_id++;
			that.fixedbox_id = fixedbox_id;
			this.element.attr("ui-fixedbox",fixedbox_id);
			this.$fixedbox = $(this.options.template);
			
			var content_exists = false;
			_.each(fixed_list,function(item){
				//查找缓存，查看是否内容有重复的（指向同一个对象
				if(item.content == that.options.content
						|| (that.options.content instanceof jQuery 
								&& item.selector == that.options.content.selector 
								&& item.prevObject[0].isEqualNode(that.options.content.prevObject[0]))){
					content_exists = true;
					that.$fixedbox = item.$fixedbox;
					return false;
				}
			});
			var o = {$fixedbox:this.$fixedbox,content:this.options.content,fixedbox_id:fixedbox_id};
			if(this.options.content instanceof jQuery){
				o.selector = this.options.content.selector;
				o.prevObject = this.options.content.prevObject;
			}
			fixed_list.push(o);
			
			if(!content_exists){
				//内容不重复的话就新增对象
				if(!(this.options.content instanceof jQuery)){
					this.$fixedbox.html(this.options.content);
				}else{
					this.options.content.show().appendTo(this.$fixedbox);
				}
				$("body").append(this.$fixedbox);
			}
			this.$fixedbox.hide();
			
			if(this.options.width != 'auto'){
				this.$fixedbox.width(this.options.width);
			}
			
//			if(this.options.height != 'auto'){
//				this.$fixedbox.outerHeight(this.options.height);
//			}
			
			this.options.init.call(this.$fixedbox);
			
			if(this.options.trigger == "click"){
				
				this._on($(document), {
	              'click': 'hide'
	            });
				
				this._on({
	               'click': 'show'
	            });
			}
			
			if(this.options.trigger == "hover"){
				this._on({
	               'mouseenter': 'show',
	               'mouseleave': 'leave'
	            });
				
				this._on(this.$fixedbox,{
	               'mouseenter': 'show',
	               'mouseleave': 'leave'
	            });
			}
		},
		resize:function(){
			//修正弹出框位置
			this.$fixedbox.css("left",this.element.offset().left);
			var dx = this.element.offset().left + this.$fixedbox.outerWidth() - document.body.clientWidth;
			if(dx > 0){
				this.$fixedbox.css("left",this.element.offset().left - dx);
			}
			
			if(this.options.placement == "right"){
				this.$fixedbox.css("left",this.element.offset().left+this.element.outerWidth() - this.$fixedbox.outerWidth());
			}
			
			var dy = this.element.offset().top+this.element.outerHeight();//-$(window).scrollTop();
			if(dy+this.$fixedbox.outerHeight() > $(window).height()+$(window).scrollTop()){
				dy -= this.$fixedbox.outerHeight() + this.element.outerHeight();
			}
			this.$fixedbox.css("top",dy);
			
			
			if($(".ui-dialog:visible").length > 0){
				this.$fixedbox.css("z-index","1060");
			}else{
				this.$fixedbox.css("z-index","");
			}
		},
		show:function(e){
			this.fixedboxshow();
			this.options.show.call(this.$fixedbox,e);
		},
		
		fixedboxshow:function(){
			this.resize();
			this.$fixedbox.show();
			
			if(this.leaveTimeOut){
            	clearTimeout(this.leaveTimeOut);
            	this.leaveTimeOut = null;
            }
		},
		
		hide:function(e){
			if(!this.$fixedbox.is(":visible")){
				return;
			}
			
			if(e){
				var element = this.element[0];
				
				//如果是列表调用  $(".change").fixedbox();
				
				if($(e.target).attr("ui-fixedbox") && element.className === e.target.className){
					return;
				}
				
	            // Clicking target
	            if (e.target === element || element.contains(e.target)
	            		|| e.target === this.$fixedbox[0] || this.$fixedbox[0].contains(e.target)
	            		|| element.contains(e.target.ownerDocument.activeElement) 
	            		|| this.$fixedbox[0].contains(e.target.ownerDocument.activeElement)) {
	                return;
	            }
	            e.stopPropagation();
			}
			this.$fixedbox.hide();
			this.options.hide.call(this.$fixedbox);
			
		},
		leave:function(){
			var ts = this;
			if(!this.leaveTimeOut){
				this.leaveTimeOut = setTimeout(function(){
					ts.$fixedbox.hide();
					ts.options.hide();
				});
			}
		},
		getFixedBox:function(){
			return this.$fixedbox;
		}
		//考虑到可能出现强行remove后重新初始化的情况，暂时不启用
//		_destroy:function(){
//			var that = this;
//			var box_exists = false;
//			_.each(fixed_list,function(item,index){
//				//在本地缓存内移除自己所属的对象
//				if(item.fixedbox_id == that.fixedbox_id){
//					fixed_list.splice(index,1);
//					return false;
//				}
//			});
//			
//			_.each(fixed_list,function(item,index){
//				if(item.$fixedbox == that.$fixedbox){
//					//如果自己拥有的fixedbox在缓存里依然有引用，则标记
//					box_exists = true;
//					return false;
//				}
//			});
//			if(!box_exists){
//				//如果这个fixedbox在缓存里已经没有引用，才移除
//				
//				//that.$fixedbox.remove();
//			}
//		}
	});
}();
!function(){
	"use strict";
	
	var feature = {};
    feature.fileapi = $("<input type='file'/>").get(0).files !== undefined;
    feature.formdata = window.FormData !== undefined;
    
	//重载表格
	$.widget("ui.form",$.ui.form,{
		//改写获取值方法，弥补控件取值导致的问题
		formToArray:function(){
           var a = [];
            if (this.length === 0) {
                return a;
            }

            var form = this.element[0];
            var els = form.elements;
            var elements;

            if (!els || !els.length) {
                return a;
            }

            var i, j, n, v, el, max, jmax;
            for (i = 0, max = els.length; i < max; i++) {
                el = els[i];
                n = el.name;
                //      if (!n || el.disabled) {
                //        continue;
                //      }
                if (!n) {
                    continue;
                }

                v = $.fieldValue(el, true);
                var widget = $.data(el, "formfield"); //目前没有处理控件组(如icheck控件)的概念
                if (widget) {
                    var value = widget._formGetValue(); //需要有返回值
                    if (!_.isUndefined(value)) {
                        v = value;
                    }
                }
                if (v && v.constructor == Array) {
                    if (elements) {
                        elements.push(el);
                    }
                    for (j = 0, jmax = v.length; j < jmax; j++) {
                        a.push({
                            name: n,
                            value: v[j]
                        });
                    }
                } else if (feature.fileapi && el.type == 'file') {
                    if (elements) {
                        elements.push(el);
                    }
                    var files = el.files;
                    if (files.length) {
                        for (j = 0; j < files.length; j++) {
                            a.push({
                                name: n,
                                value: files[j],
                                type: el.type
                            });
                        }
                    } else {
                        // #180
                        a.push({
                            name: n,
                            value: '',
                            type: el.type
                        });
                    }
                } else if (v !== null && typeof v != 'undefined') {
                    if (elements) {
                        elements.push(el);
                    }
                    a.push({
                        name: n,
                        value: v,
                        type: el.type,
                        required: el.required
                    });
                }
            }

            if (form.clk) {
                // input type=='image' are not found in elements array! handle it here
                var $input = $(form.clk),
                    input = $input[0];
                n = input.name;
                if (n && input.type == 'image') { //&& !input.disabled
                    a.push({
                        name: n,
                        value: $input.val()
                    });
                    a.push({
                        name: n + '.x',
                        value: form.clk_x
                    }, {
                        name: n + '.y',
                        value: form.clk_y
                    });
                }
            }
            return a;
		},

        // 修正IE9下无法捕获input.change事件导致使用val()改变input值时placeholder无法隐藏的问题
        _setValue: function (newVal) {
            if ($.type(newVal) !== 'object') return;

            var $element = this.element,
                widget;
            for (var key in newVal) {
                var $el = $element.find('[name=' + key + ']');
                if (!$el[0]) continue;

                //#750 radio/checkbox(排除switchbutton)传入参数转换为数组
                if (($el[0].type === "checkbox" || $el[0].type === "radio") && !$el.hasClass('_formIngoreValue')) {
                    newVal[key] = $.isArray(newVal[key]) ? newVal[key] : [].concat(newVal[key]);
                }

                //普通元素
                try {
                    // 对input派发placeholder命名空间下的change事件，在placeholder控件中监听该事件
                    // 用于获取input value是否被修改
                    $element.find('[name=' + key + ']:not(._formIngoreValue)').val(newVal[key])
                                                                              .triggerHandler('change.placeholder');
                } catch (e) {
                    $.error('copy value to form field error,please check');
                }
                //控件增加,覆盖方式;先处理普通元素,spinner控件可以不需要监听setValue事件
                for (var i = 0; i < $el.length; i++) { //checkbox存在多个
                    widget = $.data($el[i], "formfield");
                    if (widget) {
                        widget._formSetValue(newVal[key]);
                    }
                }
            }
            this.element.triggerHandler('afterFormSetValue', {formData: newVal});
        },
	});
}();
/**
 * 列表式表单控件
 * $().listform();
 * 通过数组数据自动生成对应的表单列表结构
 */
!function(){
	'use strict';
	
	$.widget('ui.listform',{
		datalist: [],//内部用于存储原始数据的数组
		formlist: [],//内部用于存储form的JQ对象引用数组
		options:{
			templates: '',//表单的模版，至少得是一个内部存在form的DOM对象的HTML
			selector:'',//表单模板的选择器，传这个的话可以让页面里已经存在的一个DOM成为模板，但templates配置优先
			data:[], //默认数据项
			firsthide:[],//选择器数组，用于处理第一个表单里需要隐藏该数组内指定的元素，之后的表单都显示
			firstshow:[],//选择器数组，用于处理第一个表单里需要显示该数组内指定的元素，之后的表单都隐藏
			forminit: $.noop, //每个单独的表单渲染后，执行的回调函数;该函数绑定于单独表单的jquery对象上执行，可用this.find等形式进行JQUERY操作
			alwaysshow: false//是否必定显示至少一个，即使没有任何数据
		},
		_init:function(){
			var options = this.options;
			if(!options.selector && !options.templates){
				console.error('ListForm未能初始化，请检查配置！');
			}else{
				if(options.selector && !options.templates){
					options.templates = $(options.selector).html();
				}
				this.reloadData(options.data)
			}
		},
		reloadData: function(data){
			if($.isArray(data)){
				this.datalist = data;
			}
			
			this._reloadData();
		},
		_reloadData: function(){
			var ts = this;
			var data = ts.datalist;
			this.cleanData();
			var $template = $(ts.options.templates);
			if(data.length == 0 && ts.options.alwaysshow){
				ts.addForm();
			}
			
			for(var i=0;i<data.length;i++){
				var item = data[i];
				ts.addForm(item,i);
			}
		},
		cleanData: function(){
			if(this.formlist.length > 0){
				_.each(this.formlist,function($form){
					$form.find('form').form('destroy');
				});
				this.formlist = [];
			}
			this.datalist = [];
			this.element.empty();//清理
		},
		addForm: function(item,index){
			item = item || {};
			
			var ts = this;
			var i = ts.formlist.length;
			var $template = $(ts.options.templates);
			this.element.append($template);
			
			//FIX:在formlist执行前立刻缓存
			var dom_list = $template.find('form');
			
			if($.isFunction(ts.options.forminit)){
				//执行初始化回调函数
				var func = fish.bind(ts.options.forminit,$template);
				func(item,index);
			}
			
			//处理首个隐藏及显示配置
			if(i == 0){
				if(ts.options.firsthide.length > 0){
					_.each(ts.options.firsthide,function(selector){
						$template.find(selector).hide();
					});
				}
				
				if(ts.options.firstshow.length > 0){
					_.each(ts.options.firsthide,function(selector){
						$template.find(selector).show();
					});
				}
			}else{
				if(ts.options.firstshow.length > 0){
					_.each(ts.options.firsthide,function(selector){
						$template.find(selector).hide();
					});
				}
			}
			
			//对插入的dom的form标签都执行form初始化
			dom_list.each(function(index){
				$(this).form();
				if(_.isObject(item)){
					$(this).form('value',item);
				}
			});
			ts.formlist.push($template);//把这个JQ对象放到缓存里
		},
		value: function(data){
			if(data){
				this.reloadData(data);
			}else{
				var result = [];
				if(this.formlist.length > 0){
					_.each(this.formlist,function($form){
						var item = {};
						$form.find('form').each(function(){
							$.extend(item,$(this).form('value'));
						});
						result.push(item);
					});
					return result;
				}
			}
		}
	});
}();
! function(){
	"use strict";

	/**
	 * fish.grid控件扩展
	 */
	$.widget('ui.grid',$.ui.grid,{
		options:{
			web_root:"", //中心应用名称
			autoUrl:true,
			treeIconWidth: 18, //字体图标宽度，单位为px，默认为18px
			showTreeLine: false, //是否显示树表格线条，默认为false
			borderStyle: "default", 	// 表格边框css样式设置，默认为不改变样式
										// "none"：表格没有边框
										// "bottom"：表格只有底部边框
										// 其他字符串：为表格增加对应名称的css class
			forceFit:true, //修改默认为true
            relativeDom: {
                element: "",    // 用于grid设置高度时的参照DOM对象，可以为jQuery对象或DOM类名字符串
                                // 在grid的resize事件响应时会根据该参照对象的高度设置grid的高度
                hideScroll: true   //是否将参照对象的滚动条关闭，默认为true
            } 
            				
		}, 

        /**
         * 修改表格高度
         * @param {Number} nh 表格新的高度，可以带单位
         */
        setGridHeight: function(nh) {
            var ts = this;
            if (!ts.grid) {
                return;
            }
            var $el = $(ts.element);
            if (!isNaN(ts.p.height)) {
                if (ts.p.height < 0 && ts.p.relativeDom.element) {
                    nh = nh - $el.outerHeight(); // 修正在使用参考对象时ts.p.height为负数引起的body高度计算错误的问题
                                                 // 在使用参考对象时，传入参数的nh即为参考对象的高度   
                } else {
                    nh = nh - ($el.outerHeight() - ts.p.height);
                }
            }
            var bDiv = $(ts.grid.bDiv);
            bDiv.css({
                height: nh + (isNaN(nh) ? "" : "px")
            });
            if (ts.p.frozenColumns === true) {
                //follow the original set height to use 16, better scrollbar width detection
                $('#' + ts.p.id + "_frozen").parent().height(bDiv.height() - 16);
            }
            ts.p.height = nh;

            //重新加载slimscroll滚动范围
            bDiv.slimscroll({
                height: bDiv.height(),
                width: ts.element.width()
            });
        },

        _resize: function() {
            var ts = this, parentWidth = ts.element.parent().width();

            if ($("#" + ts.p.id).length < 1) {
                console.warn("grid[" + ts.p.id + "]内存泄露,dom中已经不存在,请检查是否调用了remove方法");
            }
            //表格隐藏状态下width能取到负值
            if (!ts._gridVisible()) {
                return false;
            }
            
            if (parentWidth < 100) {
                console.warn("grid[" + ts.p.id + "] 表格宽度resize,父容器取到宽度只有:" + parentWidth + " (建议为grid单独套一层div)");
            }
            if (parentWidth !== ts.lastParentWidth) {
                ts.setGridWidth(parentWidth);
                ts.lastParentWidth = parentWidth;

                ts.navButtonRefresh();
            }

            if (ts.p.relativeDom && ts.p.relativeDom.element) {
                if (ts.p.relativeDom.element instanceof jQuery) {
                    ts.setGridHeight(Math.floor(ts.p.relativeDom.element.height()));
                    if (ts.p.relativeDom.hideScroll) {
                        ts.p.relativeDom.element.css({
                            'overflow': 'hidden'
                        });
                    }
                } else if (typeof(ts.p.relativeDom.element) === "string") {
                    ts.setGridHeight(Math.floor(ts.element.parent("." + ts.p.relativeDom.element).height()));
                    if (ts.p.relativeDom.hideScroll) {
                        ts.element.parent("." + ts.p.relativeDom.element).css({
                            'overflow': 'hidden'
                        });
                    }
                } else {
                    console.log("gird.options.relativeDom: element 参数必须为 jQuery 对象或非空 DOM class 字符串");
                }
                
            }
        },

		/**
		 * 重新计算滚动条大小方法，用于处理一些自己增加的额外元素的情况
		 */
		reloadAutoScroll: function () {
            var ts = this;
            if (ts.p.height === 'auto') {
                $('.ui-jqgrid-bdiv', ts.element).css("height","auto");

                $(ts.grid.bDiv).slimscroll({
                    height: $('.ui-jqgrid-bdiv', ts.element).outerHeight()
                });
            }
        },
		/**
		 * 覆盖原始的加载数据方法，让datatype由实际传入数据的瞬间决定
		 * 如果传参时数据是数组，则认为是local，如果不是数组，则认为是json
		 */
		reloadData: function(newData) {			
            if (newData) {
                var dtype = $.isArray(newData)?"local":"json";
                $(this.element).grid("setGridParam", {
                    "datatype": dtype
                });
	            if(!this.p){
					//p是options的别名，没有p代表原生的create方法还没有得到执行，这时执行原生的reloadData会出现问题
	            	//只修改data参数，当create方法被执行的时候就会自动加载了
					this.options.data = newData;
					return;
				}
            }
            
            this._super(newData);
        },
        _create : function () {
		    var ts = this;

            //修改grid模板
            $.jgrid.tpl =
                '<div class="ui-jqgrid" id="{{id}}">\
                    <div class="ui-jqgrid-view" id="gview_{{id}}">\
                        {{#if showTitlebar}}\
                    <div class="ui-jqgrid-titlebar clearfix">\
                        {{#if caption}}\
                    <span class="ui-jqgrid-title">{{caption}}</span>\
                        {{/if}}\
                        {{#if hidegrid}}\
                    <a role="link" class="ui-jqgrid-titlebar-close HeaderButton">\
                        <span class="glyphicon glyphicon-triangle-top"></span>\
                    </a>\
                        {{/if}}\
                        {{#if searchbar}}\
                    <div class="input-group search-group{{#if caption}} pull-right{{/if}}"></div>\
                        {{/if}}\
                    </div>\
                         {{/if}}\
                         {{#if topbar}}\
                    <div class="ui-userdata ui-userdata-t" id="t_{{id}}"></div>\
                        {{/if}}\
                    <div class="ui-jqgrid-hdiv" {{#if colHide}}style="display:none;"{{/if}}>\
             <div class="ui-jqgrid-hbox">\
             <table class="ui-jqgrid-htable" role="grid" aria-labelledby="{{id}}" cellspacing="0" cellpadding="0" border="0">\
             <thead>\
             <tr class="ui-jqgrid-labels" role="rowheader">\
             {{#colModel}}\
             <th id="{{../id}}_{{name}}" role="columnheader" class="ui-state-default ui-th-column" title="{{headertitle}}">\
             {{#if resizable}}\
             <span class="ui-jqgrid-resize">&nbsp;</span>\
             {{/if}}\
             <div id="jqgh_{{../id}}_{{name}}">\
             {{#ifCond name "===" "cb"}}\
             <input role="checkbox" id="cb_{{../../id}}" class="cbox" type="checkbox">\
             {{else}}{{label}}{{/ifCond}}\
             {{#if sortable}}\
             <span class="s-ico" style="display:none">\
             <span sort="asc" class="ui-grid-ico-sort ui-icon-asc ui-state-disabled glyphicon glyphicon-triangle-top"></span>\
             <span sort="desc" class="ui-grid-ico-sort ui-icon-desc ui-state-disabled glyphicon glyphicon-triangle-bottom"></span>\
             </span>\
             {{/if}}\
             </div>\
             </th>\
             {{/colModel}}\
             </tr>\
             </thead>\
             </table>\
             </div>\
             </div>\
             <div class="ui-jqgrid-bdiv" style="height: {{height}}px;">\
             <div>\
             <div></div>\
             <table id="btable_{{id}}" tabindex="0" cellspacing="0" cellpadding="0" border="0" role="grid" aria-multiselectable="{{multiselect}}" aria-labelledby="{{id}}" class="ui-jqgrid-btable">\
             <tbody>\
             <tr class="jqgfirstrow" role="row" style="height:auto">\
             {{#colModel}}\
             <td role="gridcell" style="height:0.01px;"></td>\
             {{/colModel}}\
             </tr>\
             </tbody>\
             </table>\
             </div>\
             </div>\
             {{#if footerrow}}\
             <div class="ui-jqgrid-sdiv">\
             <div class="ui-jqgrid-hbox">\
             <table role="grid" class="ui-jqgrid-ftable" cellspacing="0" cellpadding="0" border="0">\
             <tbody>\
             <tr role="row" class="footrow">\
             </tr>\
             </tbody>\
             </table>\
             </div>\
             </div>\
             {{/if}}\
             {{#if bottombar}}\
             <div class="ui-userdata ui-userdata-tb" id="tb_{{id}}"></div>\
             {{/if}}\
             </div>\
             <div class="ui-jqgrid-resize-mark" id="rs_m{{id}}">&nbsp;</div>\
             {{#if pagebar}}\
             <div id="{{id}}_pager" class="ui-jqgrid-pager">\
             <div id="{{id}}_pager_left" class="ui-pg-button"></div>\
             <div id="{{id}}_pager_right" class="ui-pg-control"></div>\
             </div>\
             {{/if}}\
             </div>';
            
            ts._super();
            
            // 修复树表格在ts.originData变量初始化后再在populate()中修改ts.p.data引起的
            // ts.originData无法准确指示初始化表格元素时的原始数据记录的问题，
            // 该问题会导致搜索树表格方法中无法通过ts.originData值恢复原始数据的错误
            if (ts.p.treeGrid && ts.p.searchMode === "filter") {
            	// 执行完父构造方法的populate()后重复绑定更新后的ts.p.data变量
                ts.originData = ts.p.datatype === "local" ? ts.p.data : "";
            }
        },
        
        //
        _formatOption:function(){
        	var ts = this;
        	ts._super();
        	 //处理attr_code翻译
        	var code_load = [];
        	_.each(ts.options.colModel,function(item,index){
        		if(item.attr_code){
        			if(!fish._codecache){
        				fish._codecache = {};
        			}
        			if(!fish._codecache[item.attr_code]){
        				code_load.push(item.attr_code);
        			}
        			
        			ts.options.colModel[index].formatter = function(val){
        				var result = val || "";
        				if(fish._codecache[item.attr_code]){
        					_.each(fish._codecache[item.attr_code],function(data){
        						if(data.attrValue == val && data.attrValueDesc){
        							result = data.attrValueDesc;
        							return;
        						}
        					});
        				}
        				return result;
        			};
        		}
        	});
        	
        	if(code_load.length > 0){
        		_.each(code_load,function(code){
        			fish.post(ts.options.web_root+"/StaticDataController/getStaticAttr.do",code).then(function(reply){
							fish.each(reply, function(obj){
								   obj.name = obj.attrValueDesc;
								   obj.value = obj.attrValue;
								   // obj.parentValueId
							});
							fish._codecache[code] = reply;
        			});
        		});
        	}
        },
        /**
         * 覆盖初始化方法，让grid支持url配置项
         */
        _init:function(){
        	var ts = this;
        	
        	ts._initUrlPageData();
    		ts._super();
            //执行完原有初始化方法以后加载第一页
            if(ts.options.pageData && ts.options.autoUrl){
            	$(this.element).grid("populatePage");
            }
            
            if (this.options.borderStyle && this.options.borderStyle != "default") {
            	if (this.options.borderStyle == "none") {
            		$(this.element).addClass("none-has-border");
            	} else if (this.options.borderStyle == "bottom") {
            		$(this.element).addClass("only-border");
            	} else {
            		$(this.element).addClass(this.options.borderStyle);
            	}
            }
        },
        setGridParam:function (newParams) {
        	if(newParams.url)  {
        		this.options.url = newParams.url;
        		this._initUrlPageData();
        	}
        	this._super(newParams);
        },
        _initUrlPageData:function(){
        	var ts = this;
        	if (ts.options.url && typeof ts.options.url === "string"){

        		var origUrl = ts.options.url;
        		var pos = origUrl.lastIndexOf('.do');
    		    if(pos > 0 && pos + 3 === origUrl.length ){ //以.do结尾配置全路径  orgauth/xxController/method.do

    		    }else{ //产销品中心配置的方式  market/xxxController.method
    		    	var str_arr = ts.options.url.split(".");
            		var classname = str_arr[0];
            		var method = str_arr[1];
            		origUrl = classname + "/" + method + ".do";
    		    }

        		ts.options.datatype = "json";
				ts.options.jsonReader = {
					root: "list",
					page: "pageNum",
					total: "pages",
					records: "total",
					id: "id",//
	                userdata: "userdata"
				};
        		if(!ts.options.param){
        			ts.options.param = {};//用于服务器请求的参数
        		}

        		ts.options.pageData = (function(){
        			return function(page, rowNum, sortname, sortorder,filterCol, filterVal){
        				var p_param = $.extend({},ts.options.param);

        				p_param.page = page;
                		p_param.rowNum = rowNum;
                		p_param.sortName = sortname;
                        p_param.sortOrder = sortorder;

                        //统一门户要多传
                        p_param.pageNum = page;
                        p_param.pageSize = rowNum;
                        p_param.pageSize = rowNum;

                        //先设置为option中的两个属性
                        p_param.filterCol = ts.options.filterCol;
                        p_param.filterVal = ts.options.filterVal;

                        if(filterCol){
                            p_param.filterCol = filterCol;
                        }
                        if(filterVal){
                            p_param.filterVal = filterVal;
                        }

        				fish.post(origUrl,p_param,function(reply){
    			        	if(reply){
    			        		ts.reloadData(reply);
    			        	}
                		});

                		return false;
        			};
        		})();
        	}
        },
        /**
         * (重写新增按钮方法，更改了按钮的样式；本来的逻辑没有更改)
         * 给表格新增按钮
         * @method navButtonAdd
         * @param {Object} [option]
         *     option.id  按钮的id
         *     option.cssprop 按钮附加的样式,可以是css对象,也可以是class类选择器名称
         *     option.caption = newButton 按钮显示的名称
         *     option.title 鼠标移到按钮上的提示
         *     option.buttonicon = '' 按钮图标,为空则不使用图标;可以是ui-icon ui-icon-newwin;也可以是glyphicon glyphicon-plus
         *     option.onClick 按钮点击事件
         *     option.navpos  按钮在表格中新增的位置,默认'pager',可选'topbar','bottombar',也可以是任意selector;譬如设置为'topbar',则表示将按钮添加到topbar, 此处navpos参数为空的情况会取表格的初始化属性navpos,如果还取不到则默认定位到分页栏左侧
         *     ps:按钮失效加上ui-state-disabled样式即可;默认按钮排序是左对齐,可自行设置样式控制
         */
        navButtonAdd: function(option) {
            if (option) {
                if (!$.isArray(option)) {
                    option = [option];
                }
            }
            var ts = this,
                p;
            var btngroupWidth = 0;

            for (var i = 0; i < option.length; i++) {
                var p = $.extend({
                    caption: ''
                }, option[i] || {});

                if (!p.navpos) {
                    p.navpos = this.p.navpos || 'pager';
                }
                if (p.navpos === 'topbar') {
                    p.navpos = "#t_" + ts.p.id;
                } else if (p.navpos === 'bottombar') {
                    p.navpos = "#tb_" + ts.p.id;
                } else if (p.navpos === 'pager') { //默认值
                    p.navpos = this.p.pagebar ? "#" + ts.p.id + "_pager_left" : "";
                }

                if (!p.navpos) return;
                var findnav = $(".ui-nav-btn-group", p.navpos)[0],
                    pgid = ts.p.pager;
                if (!findnav) {
                    findnav = $("<div class='btn-group ui-nav-btn-group'></div>").appendTo(p.navpos)[0];
                }
                if (p.id && $("#" + p.id, findnav).length > 0) {
                    return;
                }
                var $tbd = $("<button class='btn btn-default' type='button'>" + p.caption + "</button>");
                if (typeof p.cssprop === "string") {
                    $tbd.addClass(p.cssprop);
                } else if (typeof p.cssprop === "object") {
                    $tbd.css(p.cssprop);
                }
                p.buttonicon ? $tbd.prepend("<span class='" + p.buttonicon + "'></span>") : "";
                p.title ? $tbd.attr("title", p.title) : "";
                p.id ? $tbd.attr("id", p.id) : "";
                $tbd.appendTo(findnav).click(
                    function(p) {
                        var $this = $tbd;
                        return function(e) {
                            if ($.isFunction(p.onClick)) {
                                p.onClick.call(ts, e);
                            }
                        }
                    }(p)
                )
            } //添加按钮

            //重新计算排列按钮
            var parentWidth = $("#" + ts.p.id + "_pager").width(),
                pagerRight = $("#" + ts.p.id + "_pager_right").width();
            if (ts.options.showColumnsFeature) {
                var gridBtn = $("#" + ts.p.id + "_pager_left .js-columns");
                btngroupWidth = parentWidth - pagerRight - gridBtn.outerWidth(true);
            } else {
                btngroupWidth = parentWidth - pagerRight;
            }
            var $pager = $("#" + ts.p.id + "_pager_left");

            if ($pager && $pager.length > 0) {
                var $dropdown = $pager.find(".btn-group.ui-nav-btn-group .dropdown-toggle")[0];
                if (!$dropdown) {
                    $dropdown = $("<div class='ui-nav-btn-group'></div>");
                    var $dropdownBtn = $("<button class='ui-nav-button dropdown-toggle' data-toggle='dropdown' type='button'><span class='glyphicon glyphicon-option-horizontal'></span></button>");
                    $dropdown.append($dropdownBtn);
                    $pager.find(".btn-group.ui-nav-btn-group").append($dropdown);
                }
                var $btngroup = $pager.find('.btn-group.ui-nav-btn-group');
                var diff = $btngroup.outerWidth(true) - btngroupWidth;
                if (diff <= 0) {
                    $btngroup.find(".ui-nav-btn-group").remove();
                } else {
                    this._arrangeBtn($btngroup, btngroupWidth);
                }
            }

        },
        //提供跳转到指定页面方法
        //type为local时可能会导致异常，待考
        toPage: function(page){
            $(this.element).grid("setGridParam", {
                "page": page
            });
            $(this.element).grid("populatePage");
        },
        
        /**
         * 表格导出
         * @param param 页面的查询条件
         * @param isCurrentPage 是否导出当前页面
         * @returns
         */
        exportData:function(param,isCurrentPage){
        	//获取表格列
        	var exportData = {
                  "param": param
            };
        	 
        	var cols_orig = this.options.colModel,
                _cols = [],
                _hiddens = [];

            for (var i = 0; i < cols_orig.length; i++) {
                if (cols_orig[i].name === "cb" || cols_orig[i].name === "rn") {
                    continue; // 跳过复选框或序号列的列定义
                }
                if (cols_orig[i].hidden) {
                    _hiddens.push(cols_orig[i].name);
                } else {
                    _cols.push(cols_orig[i]);
                }
            }

        	_cols = _cols.map(function (item) {
        		var newItem = {
        			'name': item.name,
        			'label': item.label,
        			'attr_code':item.attr_code
        		};
        		return newItem;
        	});
        	
        	$.extend(exportData, {cols:_cols});
            if (isCurrentPage) {
                var currentPageIndex = $(this.element).grid("getGridParam","page"),
                    currentRowCount = $(this.element).grid("getGridParam","rowNum");
                var _data = this.options.data
                            .slice((currentPageIndex - 1) * currentRowCount, 
                                   currentPageIndex * currentRowCount)
                            .map(function(item) {
                                return _.pick(item, function (value, key, object) {
                                    return !(_.contains(_hiddens, key));
                                }, _hiddens);
                            });

                $.extend(exportData, {data:_data});
            }
            var url = param.url;
            if(!url)  url = portal.appGlobal.get("webroot") + this.options.web_root +"/HttpRequestController/exportExcel.do";
    		
            var ids = JSON.stringify(exportData);
            ids = ids.replace(/\s/g,"&nbsp;");
            
    		var $form = $("<form id='fileform' method = 'post' action="+url+"><input type='hidden' name='ids' value=" + ids + "></form>").hide();
            $("body").append($form);
            $form.submit();
            $form.remove();
        },
        
        /**
         * 处理表格树的线条
         */
        addTreeLine: function () {
        	var ts = this;
        	var tbody = $(ts.element).find("tbody");
        	var trArr = tbody.children("tr");
        	
        	// 判断每个节点有没有图标
        	var treeIcons = ts.options.treeIcons; // grid.grid("option", "treeIcons");
        	var hasIcon = true;
        	if (treeIcons.leaf == "" && 
        		treeIcons.folderOpen == "" && 
        		treeIcons.folderClosed == "") {
        		hasIcon = false;
        	}
        	var treeIconWidth = ts.options.treeIconWidth;
        	
        	var stack = []; // 栈顶为当前操作序列的dataLevel值
        					// 一个序列被定义为一个连续且dataLevel相同的tr集合
        	
        	_.each(trArr, function (item, index, list) {
        		
        		var dataLevel = $(item).attr("data-level");
        		if (dataLevel != undefined) {
        			if (stack.length == 0) {
            			stack.push(dataLevel);
            		}
        			
        			var currentSiblingDataLevel = stack[stack.length - 1];
        			
            		if (dataLevel == currentSiblingDataLevel) {
            			//当前item为当前序列的同胞元素
            			if (dataLevel != 0) { //根节点不修改任何样式
            				
            				var td = _.find($(item).children(), function (item) {
        						return $(item).css("display") != "none";
        					});
            				
            				// 增加“|-”标记
        					$(td).prepend('<span class="ui-treeline-first"></span>');
            				// 增加多个“|”标记
            				_.times(dataLevel - 1, function () {
            					$(parent_td).prepend('<span class="ui-treeline-center"></span>');
            				});
            				
            				// 修改当前元素的左边距
        					var tree_wrap = $(td).children("div.tree-wrap");
            				var tree_leaf = $(tree_wrap).children("div").first();
            				if (hasIcon) {
            					tree_wrap.css({
                					"width": treeIconWidth + "px"
                				});
                				tree_leaf.css({
                					"margin-left": "0px"
                				});
            				} else {
            					tree_wrap.css({
                					"width": "0px"
                				});
                				tree_leaf.css({
                					"margin-left": "0px"
                				});
            				}
            				
            				
        					// 若当前元素是表格最后一个元素
            				if (index == trArr.length - 1) {
            					$(td).children("span.ui-treeline-first").remove();
            					$(td).prepend('<span class="ui-treeline-end"></span>');
                			}
            				
            			}
            			
            		} else if (dataLevel > currentSiblingDataLevel) {
            			stack.push(dataLevel);
            			// 当前item为上一个序列的子元素
            			// 进入子序列，当前item为子序列的第一个元素
            			// 上一个item为当前序列的父元素

            			if (dataLevel != 0) { //根节点不修改任何样式
            				// 对当前元素进行处理
            				var td = _.find($(item).children(), function (item) {
        						return $(item).css("display") != "none";
        					});
            				
            				$(td).prepend('<span class="ui-treeline-first"></span>');
        					_.times(dataLevel - 1, function () {
            					$(td).prepend('<span class="ui-treeline-center"></span>');
            				});
        					
        					// 修改当前元素的左边距
        					var tree_wrap = $(td).children("div.tree-wrap");
            				var tree_leaf = $(tree_wrap).children("div").first();
            				if (hasIcon) {
            					tree_wrap.css({
                					"width": treeIconWidth + "px"
                				});
                				tree_leaf.css({
                					"margin-left": "0px"
                				});
            				} else {
            					tree_wrap.css({
                					"width": "0px"
                				});
                				tree_leaf.css({
                					"margin-left": "0px"
                				});
            				}
            				
            				// 修改父元素的span
            				if (dataLevel != 1) {
            					var parent_td = _.find($(trArr[index-1]).children(), function (item) {
                					return $(item).css("display") != "none";
                				});
                				_.times(dataLevel - 1, function () {
                					$(parent_td).children("span.ui-treeline-first").remove();
                					$(parent_td).prepend('<span class="ui-treeline-center"></span>');
                				});
                				
                				// 修改父元素的左边距
            					var tree_wrap = $(parent_td).children("div.tree-wrap");
                				var tree_leaf = $(tree_wrap).children("div").first();
                				if (hasIcon) {
                					tree_wrap.css({
                    					"width": 2 * treeIconWidth + "px"
                    				});
                				} else {
                					tree_wrap.css({
                    					"width": treeIconWidth + "px" // 此处为点击展开/关闭子树的三角形图标宽度
                    				});
                				}
                				
            				}
            				
            				// 若当前元素是表格最后一个元素
            				if (index == trArr.length - 1) {
            					$(td).children("span.ui-treeline-first").remove();
            					$(td).prepend('<span class="ui-treeline-end"></span>');
                			}
            			}
            		} else {
            			stack.pop();
            			// 退出子序列，当前item为上一个序列的父元素
            			
            			// 当前item的上一个item为上一个序列的最后一个元素
            			// 对这个元素进行处理
    					var prev_td = _.find($(trArr[index-1]).children(), function (item) {
        					return $(item).css("display") != "none";
        				});
    					$(prev_td).children("span.ui-treeline-first").remove();
    					$(prev_td).children("span.ui-treeline-center").remove();
    					$(prev_td).prepend('<span class="ui-treeline-end"></span>');
    					_.times(dataLevel, function () {
        					$(prev_td).prepend('<span class="ui-treeline-center"></span>');
        				});
            			
        				// 对当前元素进行处理
            			if (dataLevel != 0) { //根节点不加class
            				var td = _.find($(item).children(), function (item) {
        						return $(item).css("display") != "none";
        					});
            				
            				_.times(dataLevel - 1, function () {
            					$(td).prepend('<span class="ui-treeline-center"></span>');
            				});
            				$(td).prepend('<span class="ui-treeline-first"></span>');
            				
            				// 若当前元素是表格最后一个元素
            				if (index == trArr.length - 1) {
            					$(td).children("span.ui-treeline-first").remove();
            					$(td).prepend('<span class="ui-treeline-end"></span>');
                			}
            				
            				// 修改元素的左边距
        					var tree_wrap = $(td).children("div.tree-wrap");
            				var tree_leaf = $(tree_wrap).children("div").first();
            				if (hasIcon) {
            					tree_wrap.css({
                					"width": treeIconWidth + "px"
                				});
                				tree_leaf.css({
                					"margin-left": "0px"
                				});
            				} else {
            					tree_wrap.css({
                					"width": "0px"
                				});
                				tree_leaf.css({
                					"margin-left": "0px"
                				});
            				}
            			}
            		}
        		}
        	});
        	
        	$(ts.element).addClass("ui-tree-jqgrid");
        },
        
        reloadTreeLine: function () {
        	console.log("reload");
        	
        	var ts = this;
        	var tbody = $(ts.element).find("tbody");
        	var trArr = tbody.children("tr");
        	
        	$(trArr).find("span.ui-treeline-first").remove();
        	$(trArr).find("span.ui-treeline-center").remove();
        	$(trArr).find("span.ui-treeline-end").remove();
        	
        	ts.addTreeLine();
        },
        
        //更新分页信息
        updatepager: function(rn, dnd) {
        	this._super(rn, dnd);
        	//this.reloadTreeLine();
        	
        	//判断是否需要加入树表格线条
            if (this.options.showTreeLine) {
            	this.reloadTreeLine();
            }
            
        },
	});
}();


/*
 * copy from grid/grid.search.js
 * 表格本地搜索的时候，filter模式改为模糊匹配方式，
 * $.jgrid.from(originData).contains(ts.p.filterCol, ts.p.filterVal, {stype: "string"})
 * 原来是equals方式，数据直接使用originData，而不是ts.p.data
 */
/**
 * 表格数据筛选
 * @class fish.desktop.widget.Grid
 */
!function () {
    'use strict';

    $.extend($.ui.grid.prototype, {
        /**
         * @private
         * @method searchGrid 用searchbar对表格进行搜索
         */
        searchGrid: function () {
            var ts = this, searchOpts, originData;

            searchOpts = ts.p.searchMode === "filter" ? {target: ts.element, autocomplete: false}
                : {target: ts.element};
            $(".search-group", ts.element).searchbar(searchOpts);

            if (ts.p.searchMode === "filter") {
                ts.originData = ts.p.datatype === "local" ? ts.p.data : "";
                //增加传递originData参数
                $(".search-group", ts.element).on('searchbar:search', {context: ts}, ts.gridFilter);
                $(".search-group", ts.element).on('searchbar:filterchange', function (e, filter) {
                    resetGrid(ts.originData, ts);
                });
                $(".search-group input", ts.element).on('change', function (e) {
                    this.value === "" && resetGrid(ts.originData, ts);
                });
                $(ts.element).on("grid:reloadGrid", function(){
                    if(!ts._reloadByFilter){
                        ts.originData = ts.p.data;
                    }
                });
                $(ts.element).on("reloadGrid", function(){
                    if(!ts._reloadByFilter){
                        ts.originData = ts.p.data;
                    }
                });
            }
            //将筛选过的表格恢复成初始化状态
            function resetGrid(originData, ts) {
                ts.p.filterGrid = false;
                if (ts.originData) {
                    ts.reloadData(ts.originData);
                } else {
                    ts.populatePage();
                }
            }
        },
        /**
         * @private
         * @method gridFilter 表格数据筛选
         * @param  {Object} e 事件对象
         * @param  {Object} col 筛选列
         * @param  {String} condition 筛选条件
         */
        gridFilter: function (e, col, condition) {
            var ts = e.data.context, queryResult;
            //条件为空，则该参数恢复到表格初始状态，即为false
            ts.p.filterGrid = condition === "" ? false : true;
            ts.p.filterCol = col.value;
            ts.p.filterVal = condition;
            if (ts.p.datatype === "local") {
                //本地分页处理表格数据筛选
                //筛选条件为空则回复表格原有数据
                queryResult = condition === "" ? ts.originData : $.jgrid.from(ts.originData)
                    .contains(ts.p.filterCol, ts.p.filterVal, {stype: "string"})
                    .select();
                ts._reloadByFilter = true;
                //根据筛选结果重新加载表格
                ts.reloadData(queryResult);
                delete ts._reloadByFilter;
            } else {
                //服务端分页处理表格数据筛选
                ts.populatePage();
            }
        }
    });
}();

/**
 * 超级搜索下拉树组件 
 * 展示搜索结果；对于不存在树上的节点，进行加载；
 * 加载完毕以后对于指定的节点，使用树的selectNode方法选择对应节点，并触发滚动。
 */
!function(){
	'use strict';
	
	var searchtemplate = '<div class="ztree-search">\n\t\t\t<div class="search-heading"><div class="input-group">\n\t\t\t\t<input type="text" class="form-control hyperselect-search" placeholder="搜索内容">\n\t\t\t\t\t\t\t<div class="input-group-btn">\n\t\t\t\t\t<button class="btn btn-default" type="button"><i class="glyphicon glyphicon-search"></i></button>\n\t\t\t\t</div></div>\n\t\t</div><div class="search-main"><ul class="search-result" style="display:none;"></ul></div></div>';
	
	$.widget('ui.hypercombotree',$.ui.combotree,{
		options:{
			loadmode: 'all',//加载模式，all的话定位到指定节点会打开所有向上结构的节点，否则为仅父节点路径（残缺树）
			loader: $.noop,//当搜索到的节点不存在于树上时，获得路径的方法，要求返回从根节点开始到达所指定节点的完整节点数组，数组内的节点顺序要按层级对应
			search: $.noop,//通过搜索框输入时，查询的检测方法，返回所查询到节点的数组。无论结果的多寡，请返回数组，数据格式需与tree的格式一致
			searchtag: "" //展示搜索结果时，浮动显示在右侧的说明信息，配置为字符串时取该节点同名属性，配置为函数时为函数的执行返回值（函数接受节点数据作为参数）
			//async：在结合树插件扩展模式下，async只需要配置url和参数项，contentType和datatype由内置封装完成
		},
		_cpLock: false,  //输入框变量，用来对中文输入法输入做优化
		_inputval: "",
		_create:function(){
			//重载：添加搜索框
			var p = this.options;
			var ts = this;	
			var $template = $(searchtemplate);
			p._show = function(){
				$template.find("input").val("");
			};
			ts._super();
			ts.$dropdown = $template.find('.search-result');//检索结果的显示区域
			this.treeContainer.appendTo($template.find(".search-main"));
			//输入判断用函数
			var inputfunc = function(inputval){
				if(!inputval){
					ts._hideDropdown(true);
					return ;
				}
				var result = p.search(inputval);
				var treeOption = ts.treeContainer.tree('option');
				var keyname = treeOption.data.key.name;
				if(_.isArray(result) && result.length > 0){
					//如果查询处理方法返回的结果是一个数组，则对每个结果都进行
					ts._showDropdown(result);
				}else{
					if(p.search == $.noop){
						//没有结果，并且搜索函数没有定义时，直接在当前树上已经有的节点里寻找
						var nodelist = ts.treeContainer.tree('getNodesByParamFuzzy',keyname,inputval);
						ts._showDropdown(nodelist);
					}
				}
			};
			
			//采用新的事件来优化中文输入
			$template.find('input').on('compositionstart',function(){
				//输入法开始输入事件，上锁避免input事件错误响应
				//console.log("com start");
				ts._cpLock = true;
			});
			$template.find('input').on('compositionend',function(){
				ts._cpLock = false;
				//compositionend比input后触发，解锁后这里需要也进行一次输入判断
				//console.log("com end");
				var inputval = $(this).val();
				inputfunc(inputval);
			});
			$template.find('input').on('input',function(e){
				//搜索输入框查询事件
				if(ts._cpLock){
					return false;
				}
				
				var inputval = $(this).val();
				
				//兼容：对于compositionstart事件不能正常触发的浏览器，以对比先后值是否有改变来处理
				if (ts._inputval == inputval) {
					return false;
				}

				ts._inputval = inputval;
				//console.log("input");
				inputfunc(inputval);
			});
			this.comboTree.$content.css("overflow","hidden");
			this.comboTree.$content.css("max-height","none");
			this.comboTree.$content.prepend($template);

		},
		_showDropdown: function(data,notclean){
			//展示查询结果的框
			var ts = this;
			var treeOption = ts.treeContainer.tree('option');
			var keyname = treeOption.data.key.name;
			
			if(!notclean){
				ts._clearDropdown();
			}
			
			if(_.isArray(data) && data.length > 0){
				_.each(data,function(item){
					item[keyname] = item[keyname]?item[keyname]:"无节点名称";
					//TODO:目前搜索框的形式仅显示名字，考虑提供配置功能
					var taghtml = '<span style="float:right;">';
					if(ts.options.searchtag){
						if(typeof ts.options.searchtag === "string"){
							//字符串的话，则认为是直接取节点的对应名属性作为标签
							taghtml += item[ts.options.searchtag];
						}
						
						if($.isFunction(ts.options.searchtag)){
							//函数的话，则是这个函数执行后的返回值，这个函数传入所选节点
							taghtml += ts.options.searchtag(item);
						}
					}
					taghtml += "</span>";
					var $li = $("<li>"+item[keyname]+taghtml+"</li>");
					$li.data('node',item);
					ts.$dropdown.append($li);
				});
				ts.$dropdown.find('li').click(function(){
					//下拉框选项里的点击事件
					
					//用一种改动比较小的方法实现单双击判断
					//单击时，只将标记置为start，开始300ms的timeout再次点击
					//300ms的timeout时，先将标记位置为single再触发点击，这时当作单击
					//如果用户在300ms里再次进行点击（这时标记位还是start），则视为双击
					var timeout_str = $(this).data('timeout');
					var double_click = false;
					if(!timeout_str){//没有标记位，说明还没有点击过
						$(this).data('timeout',"start");
						var li = $(this);
						setTimeout(function(){
							if(li.data('timeout') == "start"){
								li.data('timeout',"single");
								li.click();
							}
						},300);
						return false;
					}else{
						if(timeout_str == "start"){
							//双击判定
							double_click = true;
						}else{
							//单击判定，这时肯定是single了
						}
						$(this).data('timeout',"");
					}
					//下方相当于通用判定
					
					var item = $(this).data('node');
					//先寻找树上是否有对应节点
					var sltnode = ts.treeContainer.tree('getNodeByParam',keyname,item[keyname]);
					if(!sltnode){
						//如果指定的节点并不在树上存在，则应当进行重新加载
						var loadpath = ts.options.loader(item);
						ts.loadpath = loadpath;
						//loadpath（loader的返回结果）应当是从树上第一层节点开始（如果有根节点，包括根节点），依序向下的节点数组（可以不包括目标节点）
						if($.isArray(loadpath) && loadpath.length > 0) 
						{
							var firstnode = ts.treeContainer.tree('getNodeByParam',keyname,loadpath[0][keyname]);
							if(firstnode){
								loadpath.shift();//移除第一个元素（firstnode）
								//第一个节点应当是已经在树上存在的，否则无处可挂加载的信息
								if(ts.options.loadmode == "all"){
										//因为这个功能仅用于异步，所以完全加载功能是代替用户操作展开节点
										ts.treeContainer.tree('asyncPath',loadpath,firstnode,item);
										//直接return，等待处理完成
										return;
								}else{
									//部分加载模式，获取到的节点列表即为需要进行加载的节点
									var hastarget = false; //loadpath是否包括所选择的节点
									while(loadpath.length > 0){
										var node = loadpath.shift();
										if(!node){
											break;
										}
										
										if(node[keyname] == item[keyname]){
											hastarget = true;
										}
											if(!ts.treeContainer.tree('getNodeByParam',keyname,node[keyname])){
												//有可能路径上的部分节点已经在树上存在，在这种情况下已经存在的节点不应该新增
												//不存在的话，才新增这个节点
												firstnode.zAsync = true;//因为这种做法为“残缺树”，所以关闭其原来的异步加载，下同
												ts.treeContainer.tree('addNodes',firstnode,node);
											}
											firstnode = ts.treeContainer.tree('getNodeByParam',keyname,node[keyname]);
									}
									
									if(!hastarget && ts.options.loadmode != "all"){
										//如果loadpath里没有所选节点，那么自己补上去
										firstnode.zAsync = true;
										var s = ts.treeContainer.tree('addNodes',firstnode,item);
									}
								}
								//加载完毕，再次查找一次树上的节点
								sltnode = ts.treeContainer.tree('getNodeByParam',keyname,item[keyname]);
							}else{
								console.error("在树上加载指定节点时找不到首个节点！请检查配置及loader加载方法！");
							}
						}
						
						if(!sltnode){
							//如果还是找不到指定节点，则结束这个处理
							console.error("无法在树上加载指定节点！请检查配置及loader加载方法！");
							return;
						}
					}
					//选择找到的指定节点
					ts.treeContainer.tree('selectNode',sltnode);
					//在这进行滚动
					var li_id = sltnode.tId;//使用节点ID来寻找对应的li元素
					var li_dom = ts.treeContainer.find("#"+li_id);
					//查找最顶层的li
					while(li_dom && !li_dom.parent("ul").attr("data-ui-role")){
						li_dom = li_dom.parent("ul").parent("li");
					}
					//将选中的项目滚动到成为第一项的位置
					ts.treeContainer.scrollTop(li_dom.position().top);
					if(double_click){
						//如果是双击，那么就勾选它
						ts.treeContainer.find("#"+li_id+"_check").click();
						ts.comboTree.$content.find("input").val("");
						ts._clearDropdown();
					}
					//处理完毕，隐藏搜索结果列表?
					//ts._hideDropdown();
				});
			}
			
			ts.$dropdown.show();
		},
		_hideDropdown: function(ifclean){
			var ts = this;
			if(ifclean){
				ts._clearDropdown();
			}
			ts.$dropdown.hide();
		},
		_clearDropdown: function(){
			//清理用于展示下拉列表的ul
			var ts = this;
			ts.$dropdown.empty();
		},
		_onTreeClick: function (e) {
            var prevSelectNodes = this.selectNodes;
            this.selectNodes = this.treeContainer.tree("getSelectedNodes");

            var v = [], i, value,
                l = this.selectNodes.length,
                // old = this.comboTree.$input.val(),
                id = e.target.id.slice(0, e.target.id.lastIndexOf("_")),
                curNode = this.treeContainer.tree("getNodeByTId", id);

            if (curNode && !$(e.target).hasClass('switch')) {
                this.selectNodes.sort(function compare(a, b) {
                    return a.id - b.id;
                });
                for (i = 0; i < l; i++) {
                    v[i] = this.selectNodes[i].name;
                }
                value = v.length > 0 ? v.join(",") : "";
                //调整：取消重复点击节点不触发选择事件的问题
                if (true){//prevSelectNodes[0] !== curNode) {
                    this.comboTree.$input.val(value);
                    this.element.val(value);
                    this._triggerChange();
                }
                if (this.options.closeByChooseNode) {
                    this.comboTree.hide();
                }
            }
        }
	});
}();
/**
 * 超级多选，预定支持级联查询、分组收缩、服务端远程请求、自定义查询方法等功能
 * 
 */
!function(){
	'use strict';
	
    var template = '\n    <div>\n    <ul class="ui-multiselect-choices">\n        <li class="search-field">\n            <input type="text" readOnly="true" autocomplete="off"/>\n        </li>\n    </ul>\n    </div>';
    var menutemplate = '<div class="dropdown-list">\n\t\t<div class="form-group col-md-12">\n\t\t\t<div class="input-group">\n\t\t\t\t<span class="input-group-addon">\n\t\t\t\t\t<i class="search-icon iconfont icon-search"></i>\n\t\t\t\t</span>\n\t\t\t\t<input type="text" style="width:90%;margin-right:10px;" class="form-control hyperselect-search" placeholder="搜索内容"><button type="button" class="btn btn-default js_btn"><span class="glyphicon glyphicon-chevron-left"></span></button>\n\t\t\t</div>\n\t\t</div>\n\t\t<ul class="dropdown-list ui-multiselect-results" style="width:100%;max-height:190px;position:relative;border:0"></ul>\n\t\t\n\t</div>';
   
	//var menutemplate = '<ul class="dropdown-list ui-multiselect-results"></ul>';

	$.widget("ui.hypermultiselect", $.ui.multiselect, {
		options:{
			catalog_data: [],//目录数据
			element_data: [],//元素数据
			children: 'children',//目录结构里，子节点数据的名称
			getCatalog: $.noop,//从服务端获取目录的方法
			getElement: $.noop,//从目录获取元素的方法，如果配置了getCatalog，则必须配置
			url:""//
		},
		_init: function(){
			this._super();
		},
		_setUpHtml: function () {
			//重新构建模板
            var _classes, _props, options = this.options;
            var ts = this;
            _classes = ["ui-multiselect-container"];
            if (options.inheritClasses && this.element[0].className) {
                _classes.push(this.element[0].className);
            }
            _props = {
                'class': _classes.join(' '),
                'title': this.element[0].title
            };
            if (this.element[0].id) {
                _props.id = this.element[0].id.replace(/[^\w]/g, '_') + "_multi";
            }
            this.container = $(template).attr(_props);
            this.element.hide().after(this.container);
            this.$ul = this.container.find('.ui-multiselect-choices').first();
            this.$li = this.container.find('li.search-field').first();
            this.$input = this.container.find('input').first().val(options.placeholder);
            this.$menu = $(menutemplate);

            if(options.dataSource && options.dataSource.length){
            	this._setDataSource(options.dataSource); //支持初始化dataSource属性
            }
            
            if(options.url){
            	if( options.url.indexOf(".") >= 0 ){
            		var className = options.url.split(".")[0], methodName = options.url.split(".")[1];
					fish.post(classname+"/"+methodName,{},function(reply){
                	//fish.callService(className, methodName, {}, function(reply){
                		options.dataSource = reply;
                		ts._setDataSource(options.dataSource); //支持初始化dataSource属性
    				});
            	}
            }

            this._menuBuild();
            this._setTabIndex();
            this._setLabelBehavior();
		},
		_search: function (val) {
			//增加判断，避免搜索框内部数据出现undefined
        	if(!val){
        		val = "";
        	}
        	return this._super(val);
        },
        _updateMenu: function (content) {
        	//让菜单绘制不会覆盖搜索框
            return this.$menu.find('ul.dropdown-list').html(content);
        },
        _delegateEvent: function () {
        	//在这里移除了原来对输入框的事件输入、按键事件
            var that = this;
            var options = this.options;

            //div 容器
            this._on(this.container, {
                'click': '_open',
                'mouseenter': function (evt) {
                    that._mouseOn = true;
                },
                'mouseleave': function (evt) {
                    that._mouseOn = false;
                }
            });

            // 下拉选项框
            this._on(this.$menu, {
                'mouseup': 'menuMouseup',//IMPORTANTCE!!!,通过mouseup事件，检测选中li
                'mouseenter': function (evt) {
                    that._mouseOn = true;
                },
                'mouseleave': function (evt) {
                    that._mouseOn = false;
                }
                //'mouseover': 'menuMouseover',
                //'mouseout': 'menuMouseout',
                //'mousewheel': 'menuMousewheel'
            });
            
            //新搜索框事件
            this.$menu.on('input','.hyperselect-search',function(){
            	var func = fish.bind(that._oninput,that);
            	return func($(this).val());
            });
            this.$menu.on('keydown','.hyperselect-search',function(e){
            	var func = fish.bind(that._keydown,that);
            	return func(e);
            });
            
            this.$menu.on('click', '.js_btn', function(evt){
                if( $(".ui-multiselect-choices").find("li").length > 1 ){
                	//方法一：直接删除倒数第二个li
                	var indexOfLast = $(".ui-multiselect-choices").find("li").length - 2;
                	$(".ui-multiselect-choices").children()[indexOfLast].remove();
                	
                	//方法二：直接删除最后两li，再把最后一个li追加回去
//                	var input = $(".ui-multiselect-choices").children().last();
//                	$(".ui-multiselect-choices").children().last().remove();
//                	$(".ui-multiselect-choices").children().last().remove();
//                	$(".ui-multiselect-choices").append(input);
                }
            });

            //搜索框事件
            this._on(this.$input, {
                'blur': '_blur',
                //'input': '_oninput',
                //'keydown':'_keydown',
                'focus': '_focus',
                'cut': '_clipboard',
                'paste': '_clipboard'
            });

            this._on(this.$ul, {
                'click .close': function (evt) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    if (!that.is_disabled) {
                        return that._deleteMenu($(evt.currentTarget));
                    }
                }
            });
            
        },
        _oninput: function(val){
        	//下拉面板输入框方法
        	val = val || this.$input.val();
        	this._searchFieldScale();
        	this.winnow_results(val);
        },
        results_show: function(val){
        	//重载：打开下拉菜单时清空输入框
        	this.$menu.find('.hyperselect-search').val('');
        	return this._super(val);
        },
        _keydown: function (evt) {
        	var KEY_CODE = $.ui.keyCode;
            var stroke, _ref1;
            stroke = (_ref1 = evt.which) != null ? _ref1 : evt.keyCode;
            this._searchFieldScale();
            if (stroke !== 8 && this.pending_backstroke) {
                this.clear_backstroke();
            }
            switch (stroke) {
                case KEY_CODE.BACKSPACE: //BACKSPACE
                	var $input = $(evt.target);
                    if (!$input.val() && this._choicesCount() > 0) {
                        //return this.keydown_backstroke();
                    } else if (!this.pending_backstroke) {
                        this._clearHighlightMenu();
                        return this._search($input.val().slice(0, -1));
                    }
                    break;
                case KEY_CODE.TAB: //TAB
                    this._tabHandler(evt);
                    break;
                case KEY_CODE.ENTER: //ENTER
                    evt.preventDefault();
                    if (this.results_showing) {
                        return this._selectMenu(evt);
                    }
                    break;
                case KEY_CODE.ESCAPE: //ESCAPE
                    if (this.results_showing) {
                        this.results_hide();
                    }
                    return true;
                case KEY_CODE.UP: //UP
                    evt.preventDefault();
                    this.keyup_arrow();
                    break;
                case KEY_CODE.DOWN: //DOWN
                    evt.preventDefault();
                    this.keydown_arrow();
                    break;
                default:
            }
        }
	});
}();
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
!function () {
    "use strict";

    $.widget("ui.pagination",$.ui.pagination,{
    _create : function () {
        this._super();
        //增加了样式
        $.extend(this.options, {
            'pgtextClass': 'pgtext hidden-xs hidden-sm',
            'pgrectextClass': 'pgtext hidden-xs hidden-sm'
        });
    }
    });
}();
/**
 * @class fish.desktop.widget.placeholder
 * IE8 placeholder 插件
 */
(function (window, document, $) {

    //id字段自增放到全局变量中.
    var holderCount = 0;

    /**
     * @cfg {Boolean} [RTL=false] 是否从右向左
     */

    $.fn.placeholder = function (options) {
        if (!options) {
            options = {};
        }
        var i = document.createElement('input'),
            placeholdersupport = 'placeholder' in i;
        if (!placeholdersupport) {

            this.each(function (index) {
                var input = $(this);

                //已经生成过对应的placeholder就不再生成了
                if(input.data("placeholder_label")){
                    return;
                }
                var inputParent = input.parent();
                if (inputParent.css('position') === 'static') {
                    inputParent.css('position', 'relative');
                }

                var inputId = input.attr('id');
                if (!inputId) {
                    inputId = 'placeholder' + (holderCount++);
                    input.attr('id', inputId);
                }

                var label = $('<label class="placeholder"></label>');
                label.attr('for', inputId);
                label.text(input.attr('placeholder'));

                input.data("placeholder_label", label);

                var labelClass = input.data('class');
                if (labelClass) {
                    label.addClass(labelClass);
                }

                var position = input.position();
                var css = {
                    'position': 'absolute',
                    //'top': position.top + 1,
                    'top': position.top ,
                    'cursor': 'text',
                    'z-index': 3,
                    'height': input.innerHeight(),
                    'line-height': input.innerHeight() + 'px'
                };
                if (options.RTL) {
                    var offsetRight = inputParent.outerWidth() - input.outerWidth() - input.position()['left'];
                    css['right'] = offsetRight + 6;
                } else {
                    css['left'] = position.left + 6;
                }
                label.css(css);

                if (this.value.length) {
                    label.hide();
                }

                input.after(label);

                input.on({
                    focus: function () {
                        label.hide();
                    },
                    blur: function () {
                        if (this.value == '' ) {
                            label.show();
                        }
                    },
                    "change.placeholder": function () {
                        // 修正input对象调用val()方法赋值后在IE9下无法捕获change事件的错误
                        // 该错误会导致修改后placeholder不隐藏的问题
                        // 在设置val值的地方手动派发该事件
                        input.val() ? label.hide() : label.show();
                    }
                });

                this.attachEvent('onpropertychange', function () {
                    input.val() ? label.hide() : label.show();
                });
            })
        }
        return this;
    }
})(this, document, jQuery);
!function () {
    var OPENED_MODAL_CLASS = 'modal-open',
        openedWindows = fish.modalStack.openedWindows,
        DEFAULTS = {
            content: '',
            modal: true,
            keyboard: true,
            draggable: true,
            resizable: false,
            autoDismiss: false,
            canClose: true,
            destroyOnClose: true,
            autoResizable: true,
            width: 'auto',
            height: "auto",
            position: {
                my: "center",
                at: "center",
                of: window,
                collision: "fit",
                // ensure that the titlebar is never outside the document
                using: function (pos) {
                    var topOffset = $(this).css(pos).offset().top;
                    if (topOffset < 0) {
                        $(this).css("top", pos.top - topOffset);
                    }
                }
            }
        },
        KEYCODE = $.ui.keyCode;

    function removeModalWindow(modalInstance) {
        var modalWindow = openedWindows.get(modalInstance).value,
            $body = $(document.body);

        openedWindows.remove(modalInstance);

        $(window).off('resize.' + modalWindow.popupId);

        //remove window DOM element
        modalWindow.$modalElement.off('.data-api');
        modalWindow.$modalElement.remove();

        var hasModalWin = false, opened = openedWindows.keys();
        for (var i = 0; i < opened.length; i++) {
            var win = openedWindows.get(opened[i]);
            if (win.value.$modalElement.is(':visible') && win.value.modal) {
                hasModalWin = true;
                break;
            }
        }
        $body.toggleClass(OPENED_MODAL_CLASS, hasModalWin);

        fish.modalStack.removeBackdrop();
    }

    // #553
    //判断是否需要修改遮罩层逻辑
    //①非模态窗口不修改
    //②模态窗口则修改
    function changeBackdrop(modalInstance) {
        var modalWin = openedWindows.get(modalInstance);
        if (!modalWin.value.modal) {
            return;
        }

        var topModalInstance, opened = openedWindows.keys();
        for (var i = opened.length - 1; i >= 0; i--) {
            var win = openedWindows.get(opened[i]);
            if (win.value.$modalElement.is(':visible') && win.value.modal) {
                topModalInstance = opened[i]; // 最上面的的模态窗口
                break;
            }
        }

        fish.modalStack.changeBackdrop(topModalInstance);

        $('body').toggleClass('modal-open', topModalInstance != null);
    }

    function modalOpenerFocus(modalWindow) {
        //如果modalOpener元素不存在，则指向body
        //IE8下，如果modalOpener元素不可见，则调用focus方法报错
        //由于元素不可见（隐藏or删除or父元素隐藏...）不好判断，
        //故暂时IE8下模态对话框关闭后modalOpener元素不做focus处理
        if (modalWindow.value.modalOpener && (!fish.browser.msie || fish.browser.version > 8)) {
            modalWindow.value.modalOpener.focus();
        } else {
            $('body').focus();
        }
    }

    var modalStack = {
        open: function (modalInstance, options) {
            var modalOpener = document.activeElement,
                $body = $(document.body),
                $modalElement, cssOptions, $modalBody, $modalHeader;

            var popupId = fish.uniqueId('ui-popup-');
            openedWindows.add(modalInstance, {
                popupId: popupId,
                deferred: options.deferred,
                modal: options.modal,
                keyboard: options.keyboard
            });

            fish.modalStack.addBackdrop();

            if (options.modal) {
                $body.addClass(OPENED_MODAL_CLASS);
            }

            $modalElement = $(options.content);
            $modalBody = $modalElement.find('.modal-body');
            $modalHeader = $modalElement.find('.modal-header');

            //#577
            if (options.canClose === true) {
                if ($modalHeader.find('.close').length === 0) {
                    $modalHeader.prepend(
                        '<button type="button" class="close" ' + ( options.destroyOnClose ? "data-dismiss" : "data-hide") + ' aria-label="Close"> ' +
                        '<span aria-hidden="true" class="glyphicon glyphicon-remove"></span>' +
                        '</button>');
                }
            }

            $modalElement
                .on('click.dismiss.data-api', '[data-dismiss]', function (e) {
                    modalStack.dismiss(modalInstance, 'dismiss click');
                })
                .on('click.close.data-api', '[data-close]', function (e) {
                    modalStack.close(modalInstance, 'close click');
                })
                .on('click.hide.data-api', '[data-hide]', function (e) {
                    modalStack.hide(modalInstance);
                });

            cssOptions = {
                'z-index': 1050 + (openedWindows.length() - 1) * 10,
                'display': 'block'
            };

            if (options.width !== 'auto') {
                cssOptions.width = options.width;
            }

            if (options.height !== 'auto') {
                if (isNaN(options.height)) {
                    cssOptions.height = Number(options.height.substr(0, options.height.length - 1)) / 100 * $(window).height();
                } else {
                    cssOptions.height = options.height;
                }
            }

            $modalElement.css(cssOptions);
            $body.append($modalElement);

            if (options.height !== 'auto') {
                $modalBody.css('overflow', 'auto');
                $modalBody.outerHeight($modalElement.height() - $modalHeader.outerHeight()
                    - $modalElement.find('.modal-footer').outerHeight());
            }

            $modalElement.position(options.position).data('position', options.position); // store position
            $modalElement.find('[autofocus]').focus();

            if (options.draggable) {
                $modalElement.draggable({
                    handle: ".modal-header",
                    containment: "document",
                    //#578, 如果被拖动了，则不需要进行居中
                    stop: function (event, ui) {
                        $(this).data('new-position', true);
                    }
                });
            }

            if (options.resizable) {
                $modalElement.css('position', 'absolute');
                $modalElement.resizable({
                	//FIX:不联动变化model-body大小避免宽度计算偏差
                    //alsoResize: $modalBody
                });
            }
            //#578
            if (options.autoResizable) {
                $(window).on('resize.' + popupId, fish.debounce(function () {
                	//FIX：让resize事件触发的时候，会自动调整高度（若高度是用百分比配置，且没有开启可手动调整大小功能）
                	//如果允许手动调整大小时触发此操作，会导致竖直方向被锁定，考虑是否改写
                    if(typeof options.height === "string" && options.height.indexOf('%') >= 0
                    		&& !options.resizable){
                    	$modalElement.css('height',Number(options.height.substr(0, options.height.length - 1)) / 100 * $(window).height()+"px");
                    	$modalBody.outerHeight($modalElement.height() - $modalHeader.outerHeight()
                    			- $modalElement.find('.modal-footer').outerHeight());
                    }
                    
                    if (!$modalElement.data('new-position')) {
                        $modalElement.is(':visible') && $modalElement.position($modalElement.data('position'));
                    }
                }, 300));
            }

            openedWindows.top().value.$modalElement = $modalElement;
            openedWindows.top().value.modalOpener = modalOpener;
        },

        close: function (modalInstance, result) {
            var modalWindow = openedWindows.get(modalInstance);
            if (modalWindow) {
                removeModalWindow(modalInstance);
                modalOpenerFocus(modalWindow);
                modalWindow.value.deferred.resolve(result);
                return true;
            }
            return !modalWindow;

        },

        dismiss: function (modalInstance, reason) {
            var modalWindow = openedWindows.get(modalInstance);
            if (modalWindow) {
                removeModalWindow(modalInstance);
                modalOpenerFocus(modalWindow);
                modalWindow.value.deferred.reject(reason);
                return true;
            }
            return !modalWindow;
        },

        show: function (modalInstance) {
            var modalWin = openedWindows.get(modalInstance);
            if (modalWin) {
                modalWin.value.$modalElement.show();
                changeBackdrop(modalInstance);
            }
        },

        hide: function (modalInstance) {
            var modalWin = openedWindows.get(modalInstance);
            if (modalWin) {
                modalWin.value.$modalElement.hide();
                changeBackdrop(modalInstance);
            }
        },

        isOpen: function (modalInstance) {
            var modalWin = openedWindows.get(modalInstance);
            if (modalWin) {
                return modalWin.value.$modalElement.is(':visible');
            }
            return false;
        },

        isDestroy: function (modalInstance) {
            return !openedWindows.get(modalInstance);
        },

        center: function (modalInstance) {
            var modalWin = openedWindows.get(modalInstance);
            if (modalWin) {
                modalWin.value.$modalElement.position({
                    my: "center",
                    at: "center",
                    of: window,
                    collision: "fit"
                });
            }
        }
    };

    $(document).on('keydown', function (evt) {
        var modal;

        if (evt.keyCode === KEYCODE.ESCAPE) {
            modal = openedWindows.top();
            if (modal && modal.value.keyboard) {
                evt.preventDefault();
                modalStack.dismiss(modal.key, 'escape key press');
            }
        }
    });

    fish.popup = function (options) {
        var modalResultDeferred = $.Deferred();

        var modalInstance = {
            result: modalResultDeferred.promise(),
            close: function (result) {
                return modalStack.close(modalInstance, result);
            },
            dismiss: function (reason) {
                return modalStack.dismiss(modalInstance, reason);
            },
            //#553
            show: function () {
                modalStack.show(modalInstance);
            },
            hide: function () {
                modalStack.hide(modalInstance);
            },
            isOpen: function () {
                return modalStack.isOpen(modalInstance);
            },
            isDestroy: function () {
                return modalStack.isDestroy(modalInstance);
            },
            center: function () {
                modalStack.center(modalInstance);
            }
        };

        function dismiss(e) {
            if (!$.contains(openedWindows.get(modalInstance).value.$modalElement[0], e.target)) {
                modalInstance.dismiss('click outside');
            }
        }

        modalStack.open(modalInstance, $.extend({
            deferred: modalResultDeferred
        }, DEFAULTS, options));

        if (options.autoDismiss) {
            fish.defer(function () {
                $(document).on('click', dismiss);
            });
            modalInstance.result.always(function () {
                $(document).off('click', dismiss);
            });
        }

        return modalInstance;
    };
}();
!function(){
	"use strict";

    $.widget("ui.tabs", $.ui.tabs, {
        options: {
            templateArr: ["<li><a href='#{href}'><button type='button' class='ui-tabs-close close' role='button'><span aria-hidden='true' title='close'>&times;<span class='sr-only'>Close</span></span></button>#{label}</a></li>",
                "<li><a href='#{href}'>#{label}<button type='button' class='ui-tabs-close ui-tabs-main-close close' role='button'><span aria-hidden='true' title='close' class='glyphicon glyphicon-remove-sign'></span></button></a></li>"
            ],
            tabwarp: false // 是否开启自定义tab列头功能，默认为false
        },
        /*
        {
        	templateArr:["<li><a href='#{href}'><button type='button' class='ui-tabs-close close' role='button'><span aria-hidden='true' title='close'>&times;<span class='sr-only'>Close</span></span></button>#{label}</a></li>",
        	             "<li><a href='#{href}'><button type='button' class='ui-tabs-close ui-tabs-main-close close' role='button'><span aria-hidden='true' title='close' class='iconfont icon-close'></span></button>#{label}</a></li>"]
        },
         */
       _processTabs: function () {
            var that = this,
                prevTabs = this.tabs,
                prevAnchors = this.anchors,
                prevPanels = this.panels;

            this.tablist = this._getList()
                .attr("role", "tablist")

                // Prevent users from focusing disabled tabs via click
                .delegate("> li", "mousedown" + this.eventNamespace, function (event) {
                    if ($(this).is(".ui-state-disabled")) {
                        event.preventDefault();
                    }
                })

                // support: IE <9
                // Preventing the default action in mousedown doesn't prevent IE
                // from focusing the element, so if the anchor gets focused, blur.
                // We don't have to worry about focusing the previously focused
                // element since clicking on a non-focusable element should focus
                // the body anyway.
                .delegate(".ui-tabs-anchor", "focus" + this.eventNamespace, function () {
                    if ($(this).closest("li").is(".ui-state-disabled")) {
                        this.blur();
                    }
                });

            if (this.options.tabwarp && !this.tablist.parent("div").hasClass('ui-tabs')) {
                this.tablistContainer = this.tablist.parent("div").addClass("ui-tabs-nav");
            } else {
                this.tablist.addClass('ui-tabs-nav');
            }

            this.lastTablistWidth = this.tablist.width();

            this.tabs = this.tablist.find("> li:has(a)").not('.ui-tabs-paging-prev,.ui-tabs-paging-next') //:has(a[href])
                .addClass("ui-state-default")
                .attr({
                    role: "tab",
                    tabIndex: -1
                });

            this._visibleTabs = this.tabs.filter(function(index, el) {
                return !$(el).hasClass('ui-tabs-hidden');
            });

            this.anchors = this.tabs.map(function () {
                    return $("a", this)[0];
                })
                .addClass("ui-tabs-anchor")
                .attr({
                    role: "presentation",
                    tabIndex: -1
                });

            this.panels = $();

            this.anchors.each(function (i, anchor) {
                var selector, panel, panelId,
                    anchorId = $(anchor).uniqueId().attr("id"),
                    tab = $(anchor).closest("li"),
                    originalAriaControls = tab.attr("aria-controls");

                // inline tab
                if (that._isLocal(anchor)) {
                    selector = anchor.hash;
                    panelId = selector.substring(1);
                    panel = that.element.find(that._sanitizeSelector(selector));
                } else { //没有hash的时候,
                	//修改获取TAB逻辑：改为查找有指定class的div而不是获取子元素
                    panel = that.element.children().siblings("div.ui-tabs-panel:eq(" + i + ")");
                    panelId = panel.attr("id");
                    if (!panelId) {
                        panelId = tab.attr("aria-controls") || $({}).uniqueId()[0].id;
                        panel.attr("id", panelId);
                    }
                    selector = "#" + panelId;
                    $(anchor).attr("href", selector);
                    panel.attr("aria-live", "polite");
                }

                if (panel.length) {
                    that.panels = that.panels.add(panel);
                }
                if (originalAriaControls) {
                    tab.data("ui-tabs-aria-controls", originalAriaControls);
                }
                tab.attr({
                    "aria-controls": panelId,
                    "aria-labelledby": anchorId
                });
                panel.attr("aria-labelledby", anchorId);
            });

            this.panels
                .addClass("ui-tabs-panel")
                .attr("role", "tabpanel");

            // Avoid memory leaks (#10056)
            if (prevTabs) {
                this._off(prevTabs.not(this.tabs));
                this._off(prevAnchors.not(this.anchors));
                this._off(prevPanels.not(this.panels));
            }
            if (this.options.fixedHeight) {
                this.panels.addClass('ui-tabs-panel-absolute');
            }

        },
        _getList: function () {
        	//修改获取UL逻辑：改为搜索UL而不是必定取子元素
            return this.tablist || this.element.find("ol,ul").eq(0);
        },
        _create: function() {
            var options = this.options;
            if (!options.style || !_.isFinite(options.style)) {
                options.style = 1;
            }
            //修改tab多处一栏后左右按钮的样式
            if (options.paging) {
                options.paging = {
                    nextButton  : '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>',
                    prevButton  : '<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>'
                }
            }
			options.tabCanCloseTemplate = options.templateArr[parseInt(options.style,10)];

			this._super();
		},
		add: function (o) {
			var id = o.id;
			id || $({}).uniqueId()[0].id;
			this._super(o);
//			this.element.find("#"+o.id).removeClass("page-tabs-noborder page-tabs-default page-tabs-compact");
//			if(o.noborder == 'noborder' || o.noborder == 'true'){
//				this.element.find("#"+o.id).addClass("page-tabs-noborder");
//			}else if(o.noborder == 'compact'){
//				this.element.find("#"+o.id).addClass("page-tabs-compact");
//			}else{
//				this.element.find("#"+o.id).addClass("page-tabs-default");
//			}
		}
	});
}();
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
! function(){
	"use strict";
	/**
	 * fish.tree控件扩展
	 */
	$.widget('ui.tree',$.ui.tree,{
		loadpath:null,
		_create:function(){
			var ts = this;
			var p = ts.options;
			if(!p.callback){
				p.callback = {};
			}
			var t = p.callback?p.callback.onAsyncSuccess:null;
			if(!t){
				t = $.noop;
			}
			var newcallback = function(event, treeId, treeNode, msg){
				if($.isArray(ts.loadpath)){
					//链式调用处理：
					var keyname = p.data.key.name;
					if(ts.loadpath.length > 0){
						var node = ts.loadpath.shift();
						var firstnode = ts.getNodeByParam(keyname,node[keyname]);
						ts.expandNode(firstnode,true);
					}else{
						//最后一次链式调用，选择最终节点，并且做清理工作
						var f = ts.getNodeByParam(keyname,ts.finalnode[keyname]);
						ts.selectNode(f);
						ts.pathcallback(f);//回调函数
						ts.loadpath = null;
						ts.finalnode = null;
						ts.pathcallback = null;
					}
				}
				
				t(event, treeId, treeNode, msg);
			};
			
			
			p.callback.onAsyncSuccess = newcallback;
			
			ts._super();
			if(p.async.enable && (!p.fNodes || p.fNodes.length == 0)){
				//修正：如果初始化的时候开启异步，并且没有配置初始节点，则自动化加载一轮
				ts._asyncNode(null,false,$.noop);
			}
			
			
		},
		asyncPath: function(loadpath,firstnode,finalnode,func){
			//调试：
			var ts = this;	
			if($.isArray(ts.loadpath)){
				//一次只接受一轮处理
				console.error("一个tree一次只能接受一轮链式展开！");
			}else{
				ts.loadpath = loadpath;
				ts.finalnode = finalnode;
				ts.pathcallback = func || $.noop;;
				//从第一个开始展开
				ts.expandNode(firstnode,true);
			}
		},
		_asyncNode: function(node, isSilent, callback) {
			var i, l;
			if (node && !node.isParent) {
				this._apply(callback);
				return false;
			} else if (node && node.isAjaxing) {
				return false;
			} else if (this._apply(this.p.callback.beforeAsync, [null, node], true) == false) {
				this._apply(callback);
				return false;
			}
			if (node) {
				node.isAjaxing = true;
				var icoObj = this.$(node, this.consts.id.ICON);
				icoObj.attr({
					"style": "",
					"class": this.consts.className.BUTTON + " " + this.consts.className.ICO_LOADING
				});
			}

			var tmpParam = {};
			for (i = 0, l = this.p.async.autoParam.length; node && i < l; i++) {
				var pKey = this.p.async.autoParam[i].split("="), spKey = pKey;
				if (pKey.length > 1) {
					spKey = pKey[1];
					pKey = pKey[0];
				}
				tmpParam[spKey] = node[pKey];
			}
			if (fish.isArray(this.p.async.otherParam)) {
				for (i = 0, l = this.p.async.otherParam.length; i < l; i += 2) {
					tmpParam[this.p.async.otherParam[i]] = this.p.async.otherParam[i + 1];
				}
			} else {
				for (var p in this.p.async.otherParam) {
					tmpParam[p] = this.p.async.otherParam[p];
				}
			}

			var _tmpV = this._getRoot()._ver;
			
			//URL转为采用我们封装好的形式
			var urlspilt = this.p.async.url.split(".");
			var ts = this;
			
			fish.post(urlspilt[0]+"/"+urlspilt[1]+".do",tmpParam,function(msg){
			//fish.callService(urlspilt[0],urlspilt[0],tmpParam,function(msg){
					if (_tmpV != ts._getRoot()._ver) {
						return;
					}
					var newNodes = [];
					try {
						if (!msg || msg.length == 0) {
							newNodes = [];
						//} else if (typeof msg == "string") { // do not eval string
						//	newNodes = eval("(" + msg + ")");
						} else {
							newNodes = msg;
						}
					} catch(err) {
						newNodes = msg;
					}

					if (node) {
						node.isAjaxing = null;
						node.zAsync = true;
					}
					ts._setNodeLineIcos(node);
										
					if (newNodes && newNodes !== "") {
						newNodes = ts._apply(ts.p.async.dataFilter, [node, newNodes], newNodes);
						ts._addNodes(node, newNodes ? $.tree.clone(newNodes) : [], !!isSilent);
					} else {
						ts._addNodes(node, [], !!isSilent);
					}
					ts._trigger(ts.consts.event.ASYNC_SUCCESS, [node, msg]);
					ts._apply(callback);
					ts._apply(ts.p.callback.onAsyncSuccess,[null,ts.treeId,node,msg]);
			},"",function(){
				if (_tmpV != ts._getRoot()._ver) {
					return;
				}
				if (node) node.isAjaxing = null;
				ts._setNodeLineIcos(node);
			});
//			$.ajax({
//				contentType: this.p.async.contentType,
//				type: this.p.async.type,
//				url: this._apply(this.p.async.url, [node], this.p.async.url),
//				data: tmpParam,
//				dataType: this.p.async.dataType,
//				success: (msg) => {
//
//				},
//				error: (XMLHttpRequest, textStatus, errorThrown) => {
//					if (_tmpV != this._getRoot()._ver) {
//						return;
//					}
//					if (node) node.isAjaxing = null;
//					this._setNodeLineIcos(node);
//					this._trigger(this.consts.event.ASYNC_ERROR, [node, XMLHttpRequest, textStatus, errorThrown]);
//				}
//			});
			return true;
		},
		//扩展方法：将znodes节点数据数组，转换为simpleData的格式
		//注意该方法并不会转换znode的children即子节点数据，如果是需要整体转换请先经过transformToArray
		transformToSimpleData: function(nodes){
			var r = [];
			var p = this.options;
			var key = p.data.simpleData.idKey,
				parentKey = p.data.simpleData.pIdKey,
				nameKey = p.data.key.name;
			if($.isArray(nodes)){
				_.each(nodes,function(item){
					r.push(_.pick(item,key,parentKey,nameKey));
				});
			}
			return r;
		},
		 reloadData: function reloadData(data) {
            var nodes = this.getNodes();
            //树的搜索功能：用户快速输入兼容，树还在创建过程，用户又重新查找。
            if(this.options.data.keep==undefined) {
				this.options.data.keep={}; 
				this.options.data.keep.leaf=false;
				this.options.data.keep.parent=false;
			}
            while (nodes.length) {
                this.removeNode(nodes[0]);
            }
            return this.addNodes(null, data);
        }

	});
}();
 // Check whether the element is checkbox or radio
    function checkable(el) {
        return el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio');
    }


!function () {
    "use strict";
    $.widget("ui.validator", $.ui.validator, {
        _validate: function (el, field) {
            var me = this,
                forceValidate = false;

            field = field || me.getField(el);
            if(!field) {
                return;
            }

            // 判断是否开启强制校验
            if (field.rules) {
                for (var i = 0; i < field.rules.length; i++) {
                    if (field.rules[i].method === "force") {
                        forceValidate = true;
                        break;
                    }
                }
            } else {
                if (field.rule && (field.rule.indexOf("force") > 0)) {
                    forceValidate = true;
                }
            }
            // doesn't validate the element that has "disabled" without "force" attribute
            if (el.disabled && !forceValidate) {
                return;
            }

            var msgOpt = {},
                group = field.group,
                ret,
                isValid = field.isValid = true;

            if (!field.rules) {
                me._parse(el);
            }

            // group validation
            if (group) {
                ret = group.callback.call(me, group.$elems);
                if (ret !== undefined) {
                    me.hideMsg(group.target, {}, field);
                    if (ret === true) {
                        ret = undefined;
                    } else {
                        field._i = 0;
                        field._r = 'group';
                        isValid = false;
                        me.hideMsg(el, {}, field);
                        $.extend(msgOpt, group);
                    }
                }
            }
            // if the field is not required and it has a blank value
            if (isValid && !field.required && !field.must && !el.value) {
                if ($(el).attr('data-inputstatus') === 'tip') {
                    return;
                }
                if (!checkable(el)) {
                    me._validatedField(el, field, {
                        isValid: true
                    });
                    return;
                }
            }

            // if the results are out
            if (ret !== undefined) {
                me._validatedRule(el, field, ret, msgOpt);
            } else if (field.rule) {
                me._checkRule(el, field);
            }
        }
    });

    /**
     * 增加charLength验证规则
     * 验证字段长度，与数据库验证结果匹配
     * 依照oracle使用 ZHS16GBK 字符集，汉字/全角字符使用两字节编码，字母/数字为一个字节
     * 使用方法与内置的length规则相同
     * 使用波浪线（~）表示数字范围，例如：6~（大于等于6）、~6（小于等于6）、6~16（6到16）
     */
    $.ui.validator.addRule('charLength', {
        eq: "请输入 {1} 个字符",
        gte: "请输入至少 {1} 个字符",
        lte: "请输入最多 {1} 个字符",
        rg: "请输入 {1} 到 {2} 个字符"
    }, function (element, param, field) {
        var me = this,
            len = 0,
            val = $(element).val(),
            msg = me.messages["charLength"] || '',
            p = param[0].split('~'),
            leftArg = p[0],
            rightArg = p[1],
            c = 'rg',
            args = [''];

        for (var i = 0; i < val.length; i++) {
            var a = val.charAt(i);
            // 使用正则匹配两个字节以上的字符
            if (a.match(/[^\x00-\xff]/ig) != null) {
                len += 2;
            }
            else {
                len += 1;
            }
        }

        if (p.length === 2) {
            if (leftArg && rightArg) {
                if (len >= +leftArg && len <= +rightArg) {
                    return true;
                }
                args = args.concat(p);
            } else if (leftArg && !rightArg) {
                if (len >= +leftArg) {
                    return true;
                }
                args.push(leftArg);
                c = 'gte';
            } else if (!leftArg && rightArg) {
                if (len <= +rightArg) {
                    return true;
                }
                args.push(rightArg);
                c = 'lte';
            }
        } else {
            if (len === +leftArg) {
                return true;
            }
            args.push(leftArg);
            c = 'eq';
        }

        if (msg) {
            args[0] = msg[c];
        }

        return me.renderMsg.apply(null, args);
    });
}();