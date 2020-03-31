define([
    'hbs!../template/login.html',
    '../actions/loginAction'
    ],
    function(temp,action) {
        var loginView = fish.View.extend({
            template: temp,
            //className: "login",
            events:{
                "click .js-btn_save":"onLogin"
            },

            afterRender: function(){
                this.$el.find("input[placeholder]:visible, textarea[placeholder]").placeholder();
            },
            onLogin: function(){
                var me = this;
                action.addUserInfo(function (result) {
                    console.log(result);
                })
               /* var ifvalid = me.validateLogoInfo();
                if (ifvalid) {
                    //todo：屏蔽重复登录
                    var username = me.$("#userName").val();
                    var password = me.$("#password").val();
                    $.when(me.loadPublicKeyData(username)).done(function () {
                        var modulus = me.$('#hid_modulus').val();
                        var exponent = me.$('#hid_exponent').val();
                        RSAUtils.setMaxDigits(1024);
                        var publicKey = RSAUtils.getKeyPair(exponent, '', modulus);
                        password = RSAUtils.encryptedString(publicKey, password);
                        action.loginIn({userCode : username,password : password},function (replay) {
                            if (replay) {
                                if (replay.code == -1 || replay.code == -2) {//登陆失败
                                    $('div .errorMsg').text(replay.msg).removeClass("hidden");
                                    return;
                                }
                                //成功的话则改变用户状态
                                var status = "running";
                                portal.appGlobal.set("usercode", replay.loginName);
                                portal.appGlobal.set("currentStatus", status);
                            }
                        });
                    })

                }*/
            },
            validateLogoInfo:function () {
                var me = this;
                var username = me.$("#userName").val();
                var password = me.$("#password").val();
                if (username == null || username == "") {
                    fish.toast('info', '请输入用户名或工号！');
                    return false;
                }
                if (password == null || password == "") {
                    fish.toast('info', '请输入密码!');
                    return false;
                }
                return true;
            },
            loadPublicKeyData:function (requestParam) {
                var me = this;
                var derffer = $.Deferred();
                action.loadPublicKey(requestParam,function (replay) {
                    if (replay != null && replay != "") {
                        me.$('#hid_modulus').val(replay.modulus);
                        me.$('#hid_exponent').val(replay.publicExponent);
                        derffer.resolve();
                    }
                });
                return derffer.promise();
            }

        });
        return loginView;
    });



