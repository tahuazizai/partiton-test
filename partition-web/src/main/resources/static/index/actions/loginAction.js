define(["../../portal/RestAPIHelper"], function(ajaxHelper) {
    return {
        ifHasLogin: function(succHandler) {
            return ajaxHelper.get("gmms/login/ifHasLogin", succHandler);
        },


    }
});