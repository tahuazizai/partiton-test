define(['hbs!../template/main.html',
    'i18n!../i18n/main',
    "../actions/mainAction",
    "main/views/SysMenuMainView",
], function (indexTemplate, i18n,action, homePageView) {
    var IndexView = fish.View.extend({
        template: indexTemplate,
        serialize: function () {
            return portal.appGlobal.attributes;
        },
        menuArr: [],
        events: {
            "click #updatePwrd": "updatePwrd",
            "click #userManual": "downLoadFile",
            "click .js-first-menu": "openMenus",
            "click .menu-close": "hideMenus",
            "click .js-home": "onClickHome",
            "click .general-list>li": "openView",
            "click .nav-title": "openView",
            "click .js-topbar-notice": "onTopbarNotice",
            "click .js-menu-list .item>a": "openView",
            "click .logout":"outLoginClick"
        },
        initialize: function () {
            this.setView('#tabs-home', new homePageView({username:portal.appGlobal.attributes.usercode}));
        },

        afterRender: function () {
            var that = this;
            var menu = { id: 'tabs-home',url:'main/views/SysMenuMainView'};
            this.menuArr.push(menu);

            this.$("#tabs-border").tabs({
                activate: function (e, ui) {
                    that.mainTabActivate(e, ui);
                },
                beforeRemove: function (e, ui) {
                    var panelid = ui.panel.attr("id");
                    var closeIdx = -1;
                    $.each(that.menuArr, function (index, menu) {
                        if (menu && menu.id === panelid) {
                            closeMenu = menu;
                            closeIdx = index;
                            //退出each
                            return false;
                        }
                    });
                    //移除view，触发cleanup事件
                    that.removeView("#" + panelid);
                    that.menuArr.splice(closeIdx, 1);
                    return true;
                },
               // add: that.afterAddTab.bind(that),
                paging: true,
                canClose:true,
                autoResizable: true
            });

            action.queryAllMenu(function (menuList) {
                if(menuList.length > 0){
                    $.each(menuList,function (i,item) {
                        that.addTabs("tab"+item.id,item.name);
                        that.menuArr.push(item);
                    });
                }
            });

        },

        addTabs:function (id,label) {
            var that = this;
            that.$("#tabs-border").tabs("add",
                {
                    id: id,
                    label: label
                });
        },
        mainTabActivate: function (e, ui) {
            // debugger
            var that = this;
            var panelid = ui.newPanel.attr("id");
            $.each(that.menuArr, function (index, menu) {
                if (menu && ("tab"+menu.id) === panelid) {
                   that.requireView({
                      url:menu.url,
                       selector:"#"+panelid
                   });
                }
            });
        },

        updatePwrd:function () {
            fish.popupView({
                url: "login/views/popwin/SysupdatePwdPopView",
                height : 200,
                width : 500,
                viewOption: {
                    model : {username:portal.appGlobal.attributes.usercode}
                },
                // 当弹窗视图调用this.popup.close方法关闭窗口时，会执行此回调函数
                // 通过弹窗右上角的关闭按钮关闭窗口时，不会执行此回调函数
                close: function(data) {
                    if(data==0){
                        fish.info(i18n.PASSWORD_UPDATE_FAIL);

                    }else if(data==1){
                        fish.info(i18n.PASSWORD_UPDATE_SUCCESS);
                    }else if(data==-1){
                        fish.info(i18n.PASSWORD_DECRYPTION_FAIL);
                    }
                }.bind(this)
            });
        },
        outLoginClick:function(){
            layer.confirm("确定退出?", function () {
                $.ajax({
                    type: "post",
                    url: "gmms/LoginController/loginOut.do",
                    data: "json",
                    dataType:"json",
                    success: function (result) {
                        if(result){
                            window.location.href = "index.html";
                        }
                    }
                });
            });
        }
    });

    return IndexView;
});