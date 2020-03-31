! function(){
	"use strict";
	/**
	 * fish.tree控件扩展
	 */
	$.widget('ui.tree',$.ui.tree,{
		loadpath:null,
		_create:function(){
			var ts = this;
			var p = ts.options;
			if(!p.callback){
				p.callback = {};
			}
			var t = p.callback?p.callback.onAsyncSuccess:null;
			if(!t){
				t = $.noop;
			}
			var newcallback = function(event, treeId, treeNode, msg){
				if($.isArray(ts.loadpath)){
					//链式调用处理：
					var keyname = p.data.key.name;
					if(ts.loadpath.length > 0){
						var node = ts.loadpath.shift();
						var firstnode = ts.getNodeByParam(keyname,node[keyname]);
						ts.expandNode(firstnode,true);
					}else{
						//最后一次链式调用，选择最终节点，并且做清理工作
						var f = ts.getNodeByParam(keyname,ts.finalnode[keyname]);
						ts.selectNode(f);
						ts.pathcallback(f);//回调函数
						ts.loadpath = null;
						ts.finalnode = null;
						ts.pathcallback = null;
					}
				}
				
				t(event, treeId, treeNode, msg);
			};
			
			
			p.callback.onAsyncSuccess = newcallback;
			
			ts._super();
			if(p.async.enable && (!p.fNodes || p.fNodes.length == 0)){
				//修正：如果初始化的时候开启异步，并且没有配置初始节点，则自动化加载一轮
				ts._asyncNode(null,false,$.noop);
			}
			
			
		},
		asyncPath: function(loadpath,firstnode,finalnode,func){
			//调试：
			var ts = this;	
			if($.isArray(ts.loadpath)){
				//一次只接受一轮处理
				console.error("一个tree一次只能接受一轮链式展开！");
			}else{
				ts.loadpath = loadpath;
				ts.finalnode = finalnode;
				ts.pathcallback = func || $.noop;;
				//从第一个开始展开
				ts.expandNode(firstnode,true);
			}
		},
		_asyncNode: function(node, isSilent, callback) {
			var i, l;
			if (node && !node.isParent) {
				this._apply(callback);
				return false;
			} else if (node && node.isAjaxing) {
				return false;
			} else if (this._apply(this.p.callback.beforeAsync, [null, node], true) == false) {
				this._apply(callback);
				return false;
			}
			if (node) {
				node.isAjaxing = true;
				var icoObj = this.$(node, this.consts.id.ICON);
				icoObj.attr({
					"style": "",
					"class": this.consts.className.BUTTON + " " + this.consts.className.ICO_LOADING
				});
			}

			var tmpParam = {};
			for (i = 0, l = this.p.async.autoParam.length; node && i < l; i++) {
				var pKey = this.p.async.autoParam[i].split("="), spKey = pKey;
				if (pKey.length > 1) {
					spKey = pKey[1];
					pKey = pKey[0];
				}
				tmpParam[spKey] = node[pKey];
			}
			if (fish.isArray(this.p.async.otherParam)) {
				for (i = 0, l = this.p.async.otherParam.length; i < l; i += 2) {
					tmpParam[this.p.async.otherParam[i]] = this.p.async.otherParam[i + 1];
				}
			} else {
				for (var p in this.p.async.otherParam) {
					tmpParam[p] = this.p.async.otherParam[p];
				}
			}

			var _tmpV = this._getRoot()._ver;
			
			//URL转为采用我们封装好的形式
			var urlspilt = this.p.async.url.split(".");
			var ts = this;
			
			fish.post(urlspilt[0]+"/"+urlspilt[1]+".do",tmpParam,function(msg){
			//fish.callService(urlspilt[0],urlspilt[0],tmpParam,function(msg){
					if (_tmpV != ts._getRoot()._ver) {
						return;
					}
					var newNodes = [];
					try {
						if (!msg || msg.length == 0) {
							newNodes = [];
						//} else if (typeof msg == "string") { // do not eval string
						//	newNodes = eval("(" + msg + ")");
						} else {
							newNodes = msg;
						}
					} catch(err) {
						newNodes = msg;
					}

					if (node) {
						node.isAjaxing = null;
						node.zAsync = true;
					}
					ts._setNodeLineIcos(node);
										
					if (newNodes && newNodes !== "") {
						newNodes = ts._apply(ts.p.async.dataFilter, [node, newNodes], newNodes);
						ts._addNodes(node, newNodes ? $.tree.clone(newNodes) : [], !!isSilent);
					} else {
						ts._addNodes(node, [], !!isSilent);
					}
					ts._trigger(ts.consts.event.ASYNC_SUCCESS, [node, msg]);
					ts._apply(callback);
					ts._apply(ts.p.callback.onAsyncSuccess,[null,ts.treeId,node,msg]);
			},"",function(){
				if (_tmpV != ts._getRoot()._ver) {
					return;
				}
				if (node) node.isAjaxing = null;
				ts._setNodeLineIcos(node);
			});
//			$.ajax({
//				contentType: this.p.async.contentType,
//				type: this.p.async.type,
//				url: this._apply(this.p.async.url, [node], this.p.async.url),
//				data: tmpParam,
//				dataType: this.p.async.dataType,
//				success: (msg) => {
//
//				},
//				error: (XMLHttpRequest, textStatus, errorThrown) => {
//					if (_tmpV != this._getRoot()._ver) {
//						return;
//					}
//					if (node) node.isAjaxing = null;
//					this._setNodeLineIcos(node);
//					this._trigger(this.consts.event.ASYNC_ERROR, [node, XMLHttpRequest, textStatus, errorThrown]);
//				}
//			});
			return true;
		},
		//扩展方法：将znodes节点数据数组，转换为simpleData的格式
		//注意该方法并不会转换znode的children即子节点数据，如果是需要整体转换请先经过transformToArray
		transformToSimpleData: function(nodes){
			var r = [];
			var p = this.options;
			var key = p.data.simpleData.idKey,
				parentKey = p.data.simpleData.pIdKey,
				nameKey = p.data.key.name;
			if($.isArray(nodes)){
				_.each(nodes,function(item){
					r.push(_.pick(item,key,parentKey,nameKey));
				});
			}
			return r;
		},
		 reloadData: function reloadData(data) {
            var nodes = this.getNodes();
            //树的搜索功能：用户快速输入兼容，树还在创建过程，用户又重新查找。
            if(this.options.data.keep==undefined) {
				this.options.data.keep={}; 
				this.options.data.keep.leaf=false;
				this.options.data.keep.parent=false;
			}
            while (nodes.length) {
                this.removeNode(nodes[0]);
            }
            return this.addNodes(null, data);
        }

	});
}();