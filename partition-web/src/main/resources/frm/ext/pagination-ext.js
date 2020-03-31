!function () {
    "use strict";

    $.widget("ui.pagination",$.ui.pagination,{
    _create : function () {
        this._super();
        //增加了样式
        $.extend(this.options, {
            'pgtextClass': 'pgtext hidden-xs hidden-sm',
            'pgrectextClass': 'pgtext hidden-xs hidden-sm'
        });
    }
    });
}();