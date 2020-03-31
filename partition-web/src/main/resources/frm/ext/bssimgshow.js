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
  