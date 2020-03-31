define(function() {
	return {
		/**
		 * [从一个数组中根据对应的selfField和parentField的关系构造出树形结构]
		 * @param  {[Array]} srcData     [数据源，是一个数组]
		 * @param  {[String]} selfField   [数据源中代表当前记录的key]
		 * @param  {[String]} parentField [数据源中代表父元素的key]
		 * @param  {[Object]} topFlag     [数据源中最上层的值（比如最顶部的parentField的值为null，就是表示parentField的值为null的作为根元素）]
		 * @return {[Array]}             [返回一个数组，数组中的每条元素可能有children选项，里面也是数组记录了子数据]
		 */
		getTree: function(srcData, selfField, parentField, topFlag) {
			var tree = new Array();
			if (srcData) {
				var dict = new Array();
				// add  roodnode
				var n = srcData.length;
				for (var i = 0; i < n; i++) {
					var item = srcData[i];
					dict[item[selfField]] = item;
					if (item[parentField] == topFlag || item[parentField] == "") {
						tree[tree.length] = (item); // 添加根节点
					}
				}
				// 由下至上，构造树
				for (var j = 0; j < n; j++) {
					var child = srcData[j];
					if (child[parentField] == topFlag || child[parentField] == "") {
						continue;
					}
					var parent = dict[child[parentField]];
					if (parent) {
						//child.parent = parent;
						if (!parent.children) {
							parent.children = new Array();
						}
						(parent.children)[parent.children.length] = (child);
					}
				}
				return tree;
			}
		},
		filterUpperCaseKey: function(obj) {
			var keys = fish.keys(obj),
				retObj = {};
			fish.forEach(keys, function(key) {
				if (key.toUpperCase() === key) {
					retObj[key] = obj[key];
				}
			});
			return retObj;
		},
		gridIncHeight: function($grid,delta) {
			if ($grid.outerHeight() + delta < 114) {
				$grid.jqGrid("setGridHeight", 114);
			} else {
				$grid.jqGrid("setGridHeight", $grid.outerHeight() + delta);
			}
		},
		incHeight: function($el, delta) {
			$el.height($el.height() + delta);
		},
		getDeltaHeight:function($el){
			return $el.parent().height() - $el.outerHeight(true);
		},
		seekBeforeRemRow: function($grid, rowdata) {
		    var nextrow = this.$tree.jqGrid("getNextSelection", rowdata),
                prevrow = this.$tree.jqGrid("getPrevSelection", rowdata),
                parerow = this.$tree.jqGrid("getNodeParent", rowdata);
		    if (nextrow) {
		        $grid.jqGrid("setSelection", nextrow);
		    } else if (prevrow) {
		        $grid.jqGrid("setSelection", prevrow);
		    } else if (parerow) {
		        $grid.jqGrid("setSelection", parerow);
		    }
		},
		drawViewType: function($view) {
			return $view.hasClass('ui-dialog') ? 'C' : 'M';
		},
		calcPath : function ($el) {
            var path = "",
            	bubbleUp = function ($el) {
                var $parent = $el.parent();
                //IE8不支持localname，改用nodename
                var idx = $parent.children($el[0].nodeName.toLowerCase()).index($el);
                if (path) {
                    path = $el[0].nodeName.toLowerCase() + ":eq(" + idx + ")>" + path;
                } else {
                    path = $el[0].nodeName.toLowerCase() + ":eq(" + idx + ")";
                }
                if (!$parent.hasClass("comprivroot")) {
                    return bubbleUp($parent);
                }
                return $parent;
            },
            	$view = bubbleUp($el),
            	viewType = this.drawViewType($view),
            	compid = (function () {
                var wrapid = "",
                    elemid = "";
                if ($view.parent().hasClass("ui-tabs-panel")) {
                    wrapid = $view.parent().attr("id");
                }
                if ($el.data("priv")) {
                    elemid = $el.data("priv");
                } else if ($el.attr("id")) {
                    elemid = $el.attr("id");
                } else if ($el.attr("name")) {
                    elemid = $el.attr("name");
                }
                return wrapid + "." + elemid;
            })(),
            	menuObj = portal.appGlobal.get("currentMenu");
            return {
                path: viewType + "/" + compid + "/>" + path,
                menuId: menuObj.menuId,
                menuUrl: menuObj.menuUrl
            };
        },
        extractUrlParam: function (url) {
            var compArr = url.split("?"),
                paramStr = null,
                paramObj = {};
            if (compArr.length > 1) {
                paramStr = compArr[1];
                var paramArr = paramStr.split('&');
                fish.forEach(paramArr, function (item) {
                    var pair = item.split('=');
                    if (pair.length >= 2) {
                        paramObj[pair[0]] = pair[1];
                    }
                });
            }
            return {
            	url:compArr[0],
            	params:paramObj,
            	paramStr : paramStr
            };
        },
        isFullscreenMode: function () {
            // we drop part of the criteria for fullscrenn mode identification
            // document.body.clientWidth == screen.width
            //不同浏览器screen.height是一样的，但是document.body.clientHeight取值不一样，会与screen.height相等或者比其少1px左右。
            return document.body.clientHeight <= screen.height && document.body.clientHeight > screen.height - 5;
        }
	}
});