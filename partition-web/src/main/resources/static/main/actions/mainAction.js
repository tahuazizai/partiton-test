define(["portal/RestAPIHelper"], function(ajaxHelper) {
    return {
        queryAllMenu: function(succHandler) {
            return ajaxHelper.get("gmms/main/queryAllMenu", succHandler);
        },

    }
});