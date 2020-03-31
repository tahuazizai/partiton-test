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
        	
           
        }
	});
}();