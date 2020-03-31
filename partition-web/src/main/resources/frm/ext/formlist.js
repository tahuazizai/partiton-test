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