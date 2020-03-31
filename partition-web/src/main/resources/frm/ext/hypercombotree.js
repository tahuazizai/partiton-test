//@ sourceURL=aaaaa.js
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
					/*while(li_dom && !li_dom.parent("ul").attr("data-ui-role")){
						//li_dom = li_dom.parent("ul").parent("li");
					}*/
					//将选中的项目滚动到成为第一项的位置
					ts.treeContainer.parent().scrollTop(li_dom.position().top);
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