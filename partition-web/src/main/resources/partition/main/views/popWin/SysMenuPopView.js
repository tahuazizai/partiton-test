define([
    'hbs!../../templates/popwin/SysMenuPop.html',
	'i18n!../../../common/i18n/common',
	'i18n!../../i18n/SysMenu',
	'../../actions/SysMenuAction',
	'../../../common/public/WEBConstants'
], function(popTpl,common_i18n,i18n,action,webConstants) {
    return fish.View.extend({
        el:false,
		template: popTpl,
		serialize: function () {
		  return fish.extend(i18n, common_i18n);
		},
        //事件绑定
        //事件对象的书写格式为 {"event selector": "callback"}。 
        //省略 selector(选择器,规则可参考Jquery的选择器) 则事件被绑定到视图的根元素（this.el）
        events: {
            "click .js-btn_save": 'onSaveData',
            "click .js-btn_cancel": 'closeView'
            //"click .js-close_view": 'closeView'
        },
        initialize: function() {
           
        },

        //这里用来初始化页面上要用到的fish组件
        afterRender: function() {
            var me = this;
            me.$form = me.$('.detailform').form({
                validate: 1   // 0:不校验;1:初始化form的时候检验;2:提交的时候再检验; 默认为2
            });
			me.pkFiledId = me.options.pkFiledId;
			me.winType = me.options.winType;
			if(me.options.model){
                me.$form.form('value', me.options.model);
            }
			if(me.winType && me.winType === webConstants.ACTIONTYPE.VIEW){
                me.$form.form('disable');
                me.$(".commitbtn").hide();
            }
        },
        onSaveData:function(){
            var me = this;
            var valid = this.$form.isValid();
            if(!valid){
                return;
            }
            //获取表单数据
            var record = this.$form.form('value');
			record["menuId"] = me.pkFiledId;
            if(me.pkFiledId){
                action.updateSysMenu(record,function(result){
                    me.popup.close(result);
                });
            }else{
                action.createSysMenu(record,function(result){
                    me.popup.close(result);
                });
            }
        },
        closeView:function(){
            this.popup.close();
        }
    });
});
