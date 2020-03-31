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
