define([
    'hbs!../../templates/popwin/SysUserPop.html',
	'i18n!../../i18n/SysUser',
	'../../actions/LoginAction'
], function(popTpl,i18n,action) {
    return fish.View.extend({
        el:false,
		template: popTpl,
		serialize: function () {
		  return i18n;
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

			if(me.options.model){
                me.$form.form('value', me.options.model);
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

            action.loadPublicKey({username:record.username},function (result) {
                if(result.hasOwnProperty("publicExponent")){
                    RSAUtils.setMaxDigits(1024);
                    var publicKey = RSAUtils.getKeyPair(result.publicExponent, '', result.modulus);
                    var oldPassword = RSAUtils.encryptedString(publicKey, record.oldPassword);
                    var newPassword = RSAUtils.encryptedString(publicKey, record.newPassword);
                    var param={oldPassword:oldPassword,newPassword:newPassword,username:record.username};
                    action.updatePassword(param,function (returnValue) {
                        me.popup.close(returnValue);
                    });
                }
            });
        },
        closeView:function(){
            this.popup.close();
        }
    });
});
