define(["portal/RestAPIHelper"], function(ajaxHelper) {
    return {
        ifHasLogin: function(succHandler) {
            return ajaxHelper.get("gmms/login/ifHasLogin", succHandler);
        },
        loadPublicKey: function(username,succHandler) {
            return ajaxHelper.get("gmms/login/loadPublicKey/"+username, succHandler);
        },
        loginOut: function(succHandler) {
            return ajaxHelper.get("gmms/login/loginOut", succHandler);
        },
        loginIn: function(param,succHandler) {
            return ajaxHelper.post("gmms/login/loginIn",param, succHandler);
        },
        addUserInfo: function(succHandler) {
            return ajaxHelper.get("gmms/login/addUserInfo", succHandler);
        },

    }
});