require.config({
    // Libraries
    paths: {
        knockout:"/fish-desktop/third-party/knockout/knockout.debug",
        knockout_mapping:"/fish-desktop/third-party/knockout/knockout.mapping.debug"
    }
});

$.support.cors = true;//支持跨域
fish.View.configure({manage: true, syncRender:true}); //全局设置fish使用扩展的功能
fish.setLanguage('zh'); //设置国际化语音
require(['index/views/IndexView',"knockout", "knockout_mapping"],
    function(IndexView, ko, mapping){

        ko.mapping = mapping;
        fish.ko = ko;
        window.ko = ko;

        new IndexView({
            el : $('#app') //主视图选择器
            //thirdPartyParam:{userCode:userCode}
        }).index();
    })