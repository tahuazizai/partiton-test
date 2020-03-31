define([
    'hbs!../templates/SysMenuMain.html',
	'i18n!../../common/i18n/common',
	'i18n!../i18n/SysMenu',
    '../actions/SysMenuAction',
	'../../common/contants/WEBConstants'
    ], function(mainViewTpl,common_i18n,i18n,action,webConstants) {
    return fish.View.extend({
        //设置模板
        template: mainViewTpl,
		serialize: function () {
		  return fish.extend(i18n, common_i18n);
		},
        //事件绑定
        //事件对象的书写格式为 {"event selector": "callback"}。 
        //省略 selector(选择器,规则可参考Jquery的选择器) 则事件被绑定到视图的根元素（this.el）
        events: {
            "click .js-add": 'onAddSysMenu',
            "click .js-detail": 'onViewSysMenu',
            "click .query-btn": 'querySysMenu',
            "keydown .queryform": 'querySysMenuByEnterKey'
        },

        initialize: function() {
            
        },

        //这里用来初始化页面上要用到的fish组件
        afterRender: function() {
            var me = this;
            me.$queryform = me.$(".queryform").form();
            me.initGrid();
        },
        initGrid:function(){
            var me = this;
            //在视图中推荐this.$，这样只会在当前视图中搜索选择器
            //将变量缓存到this.$busizGrid中，便于后期使用
            this.$busizGrid = this.$(".detail-grid").grid({
                height:400,
                datatype:"json",
                shrinkToFit:false,
                forceFit:true,  //当为ture时,调整列宽度不会改变表格的宽度,默认为false
                // gridview:true,  //是否开启快速加载模式,如果定义了afterInsertRow事件,此参数则要求设置为false,默认为true
                // caption : "用户列表",  //设置grid标题
                colModel: [
                {
                    name: 'menuId',
                    sortable: false,
                    hidden:true
                }
				,{
                    label : i18n.MENU_NAME,
                    name : "menuName",
                }
				,{
                    label : i18n.MENU_CODE,
                    name : "menuCode",
                }
				,{
                    label : i18n.MENU_TYPE,
                    name : "menuType",
                }
				,{
                    label : i18n.URL,
                    name : "url",
                }
				,{
                    label : i18n.TARGET,
                    name : "target",
                }
				,{
                    label : i18n.ICON,
                    name : "icon",
                }
				,{
                    label : i18n.PARENT_ID,
                    name : "parentId",
                }
				,{
                    label : i18n.PARENT_IDS,
                    name : "parentIds",
                }
				,{
                    label : i18n.SORT,
                    name : "sort",
                }
				,{
                    label : i18n.LEVEL,
                    name : "level",
                }
				,{
                    label : i18n.REMARKS,
                    name : "remarks",
                }
				,{
                    label : i18n.CREATE_BY,
                    name : "createBy",
                }
				,{
                    label : i18n.CREATE_DATE,
                    name : "createDate",
                }
				,{
                    label : i18n.UPDATE_BY,
                    name : "updateBy",
                }
				,{
                    label : i18n.UPDATE_DATE,
                    name : "updateDate",
                }
				,{
                    label : i18n.DEL_FLAG,
                    name : "delFlag",
                }
				, {
					name: i18n.COMMON_OPTIONS,
					formatter: 'actions',
					classes: 'text-primary',
					sortable: false,
					formatoptions: {
						inlineButtonAdd: function (rowdata) {
							return [{ //可以给actions类型添加多个icon图标,事件自行控制
								className: "js-detail",//每个图标的class
								icon: "glyphicon glyphicon-list-alt",//图标的样子
								title: i18n.COMMON_DETAIL
							}]
						}
					}
				}],
				beforeEditRow : me.onEditSysMenu.bind(me),
                beforeDeleteRow : me.onDelSysMenu.bind(me),
                rowNum: 10,
                rowList : [15,20,25],
                showColumnsFeature: false,
                pager: true,
                pageData: me.getPerData2.bind(me),
                autoPaged:true
            });

        },
        getPerData2:function (page, rowNum, sortname, sortorder) {
            var me = this;
            var params = {};
            params.pageNum = page;
            params.pageSize = rowNum;
            if(sortname){
                params.sortName= sortname;
                params.sortOrder= sortorder != null ? sortorder : 'asc';
            }
            action.queryPageMenu(params,function (result) {
                me.$busizGrid.grid('reloadData',{rows:result.list,page:page,records:result.total});
            });
            return false;
        },
        onAddSysMenu: function() {
            var me = this;
            fish.popupView({
                url: "dbmm/modules/core/sys/views/popwin/SysMenuPopView",
                height : 600,
                width : 800,
                // 当弹窗视图调用this.popup.close方法关闭窗口时，会执行此回调函数
                // 通过弹窗右上角的关闭按钮关闭窗口时，不会执行此回调函数
                close: function(data) {
                    if(data){
                        fish.info(i18n.HINT_ADD_SUCCESS);
                        me.$busizGrid.grid("toPage", 1);
                    }
                }.bind(this)
            });
        },
		onViewSysMenu: function() {
            var me = this;
            var record = me.$busizGrid.grid("getSelection"); 
            if(fish.isEmpty(record)){
                fish.warn(i18n.HINT_SELECT_FIRST);
                return;
            }
            fish.popupView({
                url: "dbmm/modules/core/sys/views/popwin/SysMenuPopView",
                height : 600,
                width : 800,
                // 当弹窗视图调用this.popup.close方法关闭窗口时，会执行此回调函数
                // 通过弹窗右上角的关闭按钮关闭窗口时，不会执行此回调函数
                viewOption: {
                    model : record,
					winType : webConstants.ACTIONTYPE.VIEW,
					pkFiledId : record["menuId"]
                }
            });
        },
        onEditSysMenu: function(e, rowid, data) {
            var me = this;
            fish.popupView({
                url: "dbmm/modules/core/sys/views/popwin/SysMenuPopView",
                height : 600,
                width : 800,
                // 通过viewOption向视图传递数据，在视图中可以通过this.options获取传递过来的数据
                viewOption: {
                    model : data,
					winType : webConstants.ACTIONTYPE.EDIT,
					pkFiledId : data["menuId"]
                },
                // 当弹窗视图调用this.popup.close方法关闭窗口时，会执行此回调函数
                // 通过弹窗右上角的关闭按钮关闭窗口时，不会执行此回调函数
                close: function(result) {
                    if(result){
                        fish.info(i18n.HINT_MOD_SUCCESS);
                        me.$busizGrid.grid("toPage", 1);
                    }
                }.bind(this)
            });
			return false;
        },
        onDelSysMenu: function(e, rowid, data) {
            var me = this;
            fish.confirm(i18n.HINT_DEL_CONFIRM,function(){
                action.deleteSysMenu(data["menuId"],function(result){
                    fish.info(i18n.HINT_DEL_SUCCESS);
                    me.$busizGrid.grid("delRowData",data); 
                });
            });
			return false;
        },
        querySysMenuByEnterKey:function (e) {
            //按下Enter键进行查询
            if(e.keyCode==13){
                this.querySysMenu();
            }
        },
        querySysMenu: function() {
            var me = this;
			//this.$busizGrid.grid("option", "filterVal", this.$(".businessDomainName").val());
            this.$busizGrid.grid("toPage", 1);
        }
    });
});
