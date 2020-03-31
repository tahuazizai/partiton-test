define(["frm/portal/RestAPIHelper"], function(ajaxHelper) {
    return {
        queryPageMenu: function(params,succHandler) {
            return ajaxHelper.post("gmms/main/selectGridData",params, succHandler);
        },

    }
});