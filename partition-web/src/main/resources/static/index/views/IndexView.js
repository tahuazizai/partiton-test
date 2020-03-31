define(['i18n!../i18n/index','../actions/loginAction','../../portal/portal'], function (i18n,loginAction) {
    var IndexView = fish.View.extend({
        initialize: function () {
            //监听登录状态改变
            portal.appGlobal.on("change:currentStatus", this.currentStatusChange.bind(this), this);
        },

        index: function () {
            var me=this;
            //解决Firefox和IE浏览器在页面的backspace退格键点击执行“后退”操作的问题
            var userAgent = navigator.userAgent;

            if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !(userAgent.indexOf("Opera") > -1)) {
                //对于IE
                var ieVersion = document.documentMode;
                document.onkeydown = function (e) {
                    var event = e || window.event; //获取event对象
                    var obj = event.target || event.srcElement; //获取事件源
                    var keyCode;
                    var type;
                    if(ieVersion >= 9){
                        keyCode=event.keyCode; //获取按键
                        type = event.target.localName.toLowerCase();
                    }else{
                        if (event.keyCode) {
                            keyCode = event.keyCode;
                        } else if (event.witch) {
                            keyCode = event.witch;
                        }
                        type = obj.tagName.toLowerCase();
                    }


                    if ((keyCode == 8) && (type != 'input') && (type != 'textarea') && (type != 'submit')) {
                        if (event.returnValue) {
                            event.returnValue = false;
                        }
                        if (event.preventDefault) {
                            event.preventDefault();
                        }
                    }
                };
            } else if (userAgent.indexOf("Firefox") > -1) {
                document.onkeydown = function (e) {
                    var event = e || window.event; //获取event对象
                    var code=event.keyCode; //获取按键
                    var type = event.target.localName.toLowerCase();
                    if ((code == 8) && (type != 'input') && (type != 'textarea') && (type != 'submit')) {
                        if (event.preventDefault) {
                            event.preventDefault();
                        }
                    }
                };
            };
            $.when(me.ifHasLogin()).done(function (result) {
                var status = "login";
                if(result){
                    status = "running";
                }
                portal.appGlobal.set("currentStatus", status);
            });

        },


        currentStatusChange: function () { //登录状态改变
            var me = this;
            if ("login" == portal.appGlobal.get("currentStatus")) { //如果已经登录了，则修改成main IndexView，否则变成LoginView
                this.requireView('login/views/LoginView');
            } else if ("running" == portal.appGlobal.get("currentStatus")) {
                $.when(me.ifHasLogin()).done(function (ret) {
                    if (ret) { //每次打开主页面，先判断会话是否结束
                        me.requireView('main/views/MainView');
                    }
                })
            }

        },
        ifHasLogin:function () {
            var derffer = $.Deferred();
            loginAction.ifHasLogin(function (replay) {
                if (replay.user == null) {
                    derffer.resolve(false);
                } else {
                    // appGlobal.set("menus", replay.menus);
                    portal.appGlobal.set("usercode", replay.user.loginName);
                    portal.appGlobal.set("nickname", replay.user.userName);
                    portal.appGlobal.set("userId", replay.user.id);
                    derffer.resolve(true);
                }
            });
            return derffer.promise();
        }
    });
    return IndexView;
});

