define({
    // 页面当前的操作类型，用于Form与Grid交互时传递动作
    ACTIONTYPE : {
        VIEW : "VIEW",// 显示
        NEW : "NEW",// 新增
        EDIT : "EDIT",// 编辑
        DELETE : "DELETE",// 删除
        SELECT : "SELECT" // 选择
    },
    RUNSTATE : {
        RUN : "00R",// 运行中
        STOP : "00S",// 停止
        EXCEPTION : "00E",// 异常
        ALL : "all"// 所有
    },
    CODEDATA : {
        LOGS_SOURCE_TYPE : 204,// 日志来源类型
        LOGS_CENTER_TYPE : 203,// 业务中心类型
        LOG_TYPE : 209,// 日志类型
        LOG_LEVEL : 214// 日志级别
    }
});