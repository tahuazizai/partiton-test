define(function () {

    var _loginInfo = null;
    var LoginInfo = {
        /**
         * 获取登录的用户名
         */
        getUserName:function(){
            var info = LoginInfo.getLoginInfo();
            if(!info){
                return "";
            }
            return info.userInfo.userName;
        },
        /**
         * 获取登录的用户ID
         */
        getUserId:function(){
            var info = LoginInfo.getLoginInfo();
            if(!info){
                return "";
            }
            return info.userInfo.userId;
        },

        getUserCode:function(){
            var info = LoginInfo.getLoginInfo();
            if(!info){
                return "";
            }
            return info.userInfo.userCode;
        },
        /**
         * 获取登录的用户ID
         */
        getLoginStaffId:function(){
            var info = LoginInfo.getLoginInfo();
            if(!info){
                return "";
            }
            return info.userInfo.userId;
        },
        /**
         * 获取登录的当前岗位ID
         */
        getLoginPostId:function(){
            var info = LoginInfo.getLoginInfo();
            if(!info){
                return "";
            }
            return info.userInfo.postId;
        },

        /**
         * 获取登录的当前岗位名称
         */
        getLoginPostName:function(){
            var info = LoginInfo.getLoginInfo();
            if(!info){
                return "";
            }
            return info.userInfo.postName;
        },


        getLoginInfo: function(){
            return _loginInfo;
        },
        _setLoginInfo: function(info){
            _loginInfo = info;
        }
    };

    window.LoginInfo = LoginInfo;//开放到Window对象中
    return LoginInfo;
});

