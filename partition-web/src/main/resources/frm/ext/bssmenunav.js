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