/**
 * 小助手helper
 * */
(function(){
    "use strict";

    //helper容器
    var  helperContainer = '' +
        '<div class="helper-container" >\
            <div class="helper-main">\
                <button  class="btn btn-primary helper-switch" type="button" title=""></button>\
                <ul class="helper-menu">\
                </ul>\
            </div>\
        </div>';

    var liContainer = '<li class="menu-item"><!--<i class="menu-item-icon iconfont icon-gene-shopping-cart"></i>--></li>';

    $.widget('ui.bsshelper',{
        options : {
            /*
            * id : 'id'每个li的id
            * text : '文本',
            * iconStyle : '图标样式'
            * */
            dataSource : [],//每个栏目
            direction : "default",//默认靠右
            hint : "default",//默认没有提示信息
            mouseover : false//三角形图标是点击事件还是触发事件
        },
        //创建控件方法
        _create : function(){
            this._initWidget();
        },
        //初始化方法
        _initWidget : function(){
            var items = this.options;
            this.itemLength = 0;
            if(items.dataSource && items.dataSource.length > 0){
                this.itemLength = items.dataSource.length;
            } else {
                return;
            }
            var container = $(helperContainer);
            //渲染item
            this._renderItem(container,this.itemLength);
            //控制组件靠左还是靠右，默认靠右
            this._controlDirection(container);

            this.element.append(container);
            //触发打开关闭事件
            this._delegateEvent();
            this._createHintMessage();
        },
        /**
         * 渲染每个item
         * */
        _renderItem : function(container,itemLength){
            for(var i=0;i<itemLength;i++){
                this._addNode(container,i);
            }
        },
        /**
         * 拼接每个item的html
         * */
        _addNode : function(container,num){
            //拼接每个li
            container.find('.helper-menu').append(liContainer);
            //获取每个传入的对象
            var itemObject = this.options.dataSource[num];
            //渲染文本内容
            container.find('.menu-item').eq(num).append(itemObject.text);
            //给每个li绑定个id
            if(itemObject.id){
                container.find('.menu-item').eq(num).attr('id','helper_item_'+ itemObject.id);
            }
            //渲染style
            // this._addStyle(container,num);

        },
        /**
         * 渲染style
         * */
        _addStyle : function(container,num){
            var itemObject = this.options.dataSource[num];
            if(itemObject.iconStyle != undefined){
                container.find('.menu-item-icon').eq(num).removeClass('icon-gene-shopping-cart');
                container.find('.menu-item-icon').eq(num).addClass(itemObject.iconStyle);
            }
        },
        /**
         * 控制组件靠左还是靠右，默认靠右
         * */
        _controlDirection : function(container){
            var direction = this.options.direction;
            if(direction != undefined || direction != null
                || direction != 'right'){
                container.find('.helper-container').addClass("position-left");
            }
        },
        /**
         * 控制靠左靠右
         * */
        toogleDirection : function(){
            var helperContainer = $(this.element).find(".helper-container");
            if(helperContainer.hasClass('position-left')){
                helperContainer.removeClass('position-left');
            } else {
                helperContainer.addClass('position-left');
            }
        },
        /**
         * 注册事件
         * */
        _delegateEvent : function () {
            this._on({
                'click .helper-switch' : '_openOrClose',
                'mouseover .helper-switch' : '_openOrCloseByMouseover',
                'mouseleave' : '_closeHelperContainer'
            });
            this._bindItemEvent();
        },
        /**
         * 鼠标离开div class="helper-container 隐藏该div
         * */
        _closeHelperContainer : function(){
            var container = $(this.element).find('.helper-container');
            container.removeClass('open');
        },
        /**
         * 打开关闭小助手
         * */
        _openOrClose : function(){
            var mouseover_flag = this.options.mouseover;
            if(mouseover_flag == undefined || mouseover_flag == null
                || mouseover_flag == false){
                this._openOrCloseButton();
            }
        },
        _openOrCloseButton : function(){
            var container = $(this.element).find('.helper-container');
            // var containerElement = container.find('.helper-container');
            if(container.hasClass('open')){
                container.removeClass('open');
            } else {
                container.addClass('open');
            }
        },
        /**
        * 绑定每个item事件
        * */
        _bindItemEvent : function () {
            var that = this;
            var options = that.options;
            var container = $(this.element);
            var liElement = container.find('li');
            for(var i=0;i<liElement.length;i++){
                /*(function(num){
                    $(liElement[num]).on('click',function(event){
                        me._trigger("clickitem",event,options.dataSource[num]);
                        return false;
                    });
                })(i);*/
                //每个li元素绑定数据
                $(liElement[i]).data("param", options.dataSource[i]);
                //点击事件
                $(liElement[i]).on('click',function(event){
                    //这里的this是当前被触发点击事件的元素
                    var data = $(this).data("param");
                    that._trigger("clickitem",event,data);
                });
                //鼠标悬停事件
                $(liElement[i]).on('mouseover',function(event){
                    var data = $(this).data("param");
                    that._trigger("mouseoveritem",event,data);
                });
            }
        },
        /**
         * 生成tooltip提示语
         * $(".helper-switch").tooltip('show');
         setTimeout(this.hideTooltip,3000);
         * */
        _createHintMessage : function(){
            var  that = this;
            var hintMessage = that.options.hint;
            if(hintMessage != undefined || hintMessage != null){
                $(that.element).find('.helper-switch').attr("title",hintMessage);
                $(that.element).find('.helper-switch').tooltip({placement:'left'});
                $(that.element).find('.helper-switch').tooltip('show');
                setTimeout(function () {
                    $(that.element).find('.helper-switch').tooltip('hide');
                },2000);
            }
        },
        /**小助手鼠标覆盖事件触发函数
         *  增加判断
         *  flag为有弹
         *  出框标志，有弹出框则小助手不拉出
         */
        _openOrCloseByMouseover : function () {
            var mouseover_flag = this.options.mouseover;
            var flag =$('body').find('.ui-dialog').length==0?true:false;
            if(flag&&mouseover_flag){
                this._openOrCloseButton();
            }
        }
    });
})();