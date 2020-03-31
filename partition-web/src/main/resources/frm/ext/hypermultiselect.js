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