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
            
        }
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
