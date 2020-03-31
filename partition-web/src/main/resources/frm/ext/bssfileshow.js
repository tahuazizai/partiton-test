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
  