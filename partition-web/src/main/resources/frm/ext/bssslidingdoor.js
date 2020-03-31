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
