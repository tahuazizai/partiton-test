/*
 * 水平流程时间轴
 * */
(function() {
    "use strict";
    //左按钮
    var left_btn_template = '<div class="left" style="display: none;">\
        <button btn="left" type="button" class="btn btn-default">\
        <span class="glyphicon glyphicon-menu-left"></span>\
        </button>\
        </div>';

    //右按钮
    var right_btn_template = '<div class="right" style="display: none;">\
        <button btn="right" type="button" class="btn btn-default">\
        <span class="glyphicon glyphicon-menu-right"></span>\
        </button>\
        </div>';

    //时间轴的内容框
    var step_content = '<div class="step-cont"></div>';
    var ul_element = '<ul class="row clearfix"></ul>';

    //每个流程item
    var step_item = '<li class="col-md-2 col-sm-4">\
        <i class="step-mid-line"></i>\
        <div class="step-dot-cont"><span class="step-dot"><i class="glyphicon glyphicon-ok"></i></span></div>\
        <div class="step-title"></div>\
        <div class="step-time"></div>\
        </li>';
    $.widget('ui.bsstimestep', {
        options: {
            dataSource: [] //传入参数
        },
        /*
        * 监听屏幕变化
        * */
        _resize : function () {
            /*//ul的宽度
            var ul_width = $(this.element.find('.row')).outerWidth();
            //li的宽度
            var li_width = $(this.element.find('.row li')).outerWidth();*/
            //显示的个数
            // var display_count = Math.round(ul_width / li_width);
            // this.display_count = display_count;
            var window_width = $(window).outerWidth();
            if(window_width >= 992){
                this.display_count = 6;
            } else if(window_width >= 768){
                this.display_count = 3;
            } else if(window_width < 768){
                this.display_count = 1;
            }
            // console.log("display_count:" + display_count);
            var that = this;
            $(window).resize(function (event) {
               // ul_width = $(that.element.find('.row')).outerWidth();
                // li_width = $(that.element.find('.row li')).outerWidth();//这里监听的li的宽度是不准的
                // display_count = Math.round(ul_width / li_width);
                var window_width = $(window).outerWidth();
                if(window_width >= 992){
                    that.display_count = 6;
                } else if(window_width >= 768){
                    that.display_count = 3;
                } else if(window_width < 768){
                    that.display_count = 1;
                }
                // that.display_count = display_count;
                //屏幕变化就再执行
                that._handle();
                // console.log("display_count:" + display_count);
            });
            this._handle();
        },
        _handle : function () {
            var options = this.options;
            var display_count = this.display_count;
            //当流程个数大于可显示数时，显示左右按钮
            if(this.dataLength > this.display_count){
                $(this.element.find(".left")[0]).show();
                $(this.element.find(".right")[0]).show();
            }
            //将所有li显示；用于窗口变化时，初始化原来的init显示的状态
            $(this.element.find("li")).show();
            for (var i = 0; i < this.dataLength; i++) {
                //把大于6且还没有审批的流程隐藏
                if (i >= display_count && options.dataSource[i].pass === false) {
                    // $($(ul_element).find("li")[i]).hide();
                    $(this.element.find("li")[i]).hide();
                }

                //把大于6且通过审批的流程显示相差6个item的那个item隐藏
                if (i >= display_count && options.dataSource[i].pass === true) {
                    // $($(ul_element).find("li")[i]).show();
                    // $($(ul_element).find("li")[i - display_count]).hide();

                    $(this.element.find("li")[i]).show();
                    $(this.element.find("li")[i - display_count]).hide();
                }
                //把大于6且通过审批的流程的前一个为审批的显示出来
                /*if(i >= display_count && options.dataSource[i].pass === true && !options.dataSource[i+1].pass){
                    $(this.element.find("li")[i+1]).show();
                    $(this.element.find("li")[i - display_count + 1]).hide();
                }*/
            }
            var pass_count = this.element.find(".pass").length;
            if(pass_count != 0 && pass_count != this.dataLength){
                $(this.element.find("li")[pass_count -1 + 1]).show();
                $(this.element.find("li")[pass_count -1 + 1 - display_count ]).hide();
            }
        },
        _create: function() {
            this.inita();
            this._resize();
            this._delegateEvent();
        },
        inita: function() {
            var display_count = this.display_count;

            var options = this.options;
            //流程的个数
            this.dataLength = 0;
            if (options.dataSource && options.dataSource.length > 0) {
                this.dataLength = options.dataSource.length;
            }

            // if(dataLength > 6){
                //添加左边按钮
                this.element.append(left_btn_template);
            // }

            //渲染时间轴
            for (var i = 0; i < this.dataLength; i++) {

                if (typeof options.dataSource[i].pass !== "boolean") {
                    fish.error('pass 参数传递不是 boolean类型');
                    return;
                }
                if (typeof options.dataSource[i].name !== "string") {
                    fish.error('name 参数传递不是 string类型');
                    return;
                }
                if (typeof options.dataSource[i].time !== "string") {
                    fish.error('time 参数传递不是 string类型');
                    return;
                }

                //添加每个流程item
                ul_element = $(ul_element).append(step_item);
                //添加每个流程item的名称和时间
                $($(ul_element).find(".step-title")[i]).text(options.dataSource[i].name);
                $($(ul_element).find(".step-time")[i]).text(options.dataSource[i].time);

                //添加审批通过样式
                if (options.dataSource[i].pass === true) {
                    $($(ul_element).find("li")[i]).addClass("pass");
                }
                /*
                //把大于6且还没有审批的流程隐藏
                if (i >= display_count && options.dataSource[i].pass === false) {
                    $($(ul_element).find("li")[i]).hide();
                }

                //把大于6且通过审批的流程显示相差6个item的那个item隐藏
                if (i >= display_count && options.dataSource[i].pass === true) {
                    $($(ul_element).find("li")[i]).show();
                    $($(ul_element).find("li")[i - 6]).hide();
                }
                */
            }

            //为第一个和最后一个item添加识别的class
            $($(ul_element).find("li")[0]).addClass("first-line");
            $($(ul_element).find("li")[this.dataLength - 1]).addClass("last-line");

            step_content = $(step_content).append(ul_element);
            this.element.append(step_content);
            step_content = '<div class="step-cont"></div>';
            ul_element = '<ul class="row clearfix"></ul>';

            // if(dataLength > 6){
                //添加右边按钮
                this.element.append(right_btn_template);
            // }
        },
        _delegateEvent: function() {
            var me = this;
            var options = me.options;
            //事件监听
            this._on({
                'click [btn="left"]': '_leftButton'
            });
            this._on({
                'click [btn="right"]': '_rightButton'
            })
            this._bindItemEvent();
        },
        _bindItemEvent: function() {
            var me = this;
            var options = me.options;
            var step_elements = $(this.element).find('li .step-dot-cont');
            for (var i = 0, j = step_elements.length; i < j; i++) {
                (function(num) {
                    $(step_elements[num]).on('click', function(event) {
                        //注册事件回调的方法名需要全小写，不然外面调用会监听不到
                        me._trigger("clickitem", event, options.dataSource[num]);
                        return false;
                    });
                })(i);
            }
        },
        /**
         * 选中流程事件
         * param data 选中的数据
         * param event 事件对象
         * */
        /*clickItem : function (event,data) {

        },*/
        //左边按钮：隐藏最右边的时间进度div
        _leftButton: function() {
            // fish.info("test left button");
            var me = this;
            var options = me.options;
            //流程的个数
            var dataLength = 0;
            if (options.dataSource && options.dataSource.length > 0) {
                dataLength = options.dataSource.length;
            }
            //找出第一个显示的div
            var step_dom = this.element.find("li");
            for (var i = 0, j = step_dom.length; i < j; i++) {
                //最左边已经是显示了；
                if (i == 0 && $(step_dom[i]).css("display") == "list-item") {
                    fish.info('已移到最前');
                    break;
                }
                if ($(step_dom[i]).css("display") == "list-item") {
                    $(step_dom[i - 1]).show();
                    // $(step_dom[i + 5]).hide();
                    $(step_dom[i + (this.display_count - 1)]).hide();
                }
            }
        },

        //右边按钮：隐藏最左边的时间进度div
        _rightButton: function() {
            // fish.info("test right button");
            var me = this;
            var options = me.options;
            //流程的个数
            var dataLength = 0;
            if (options.dataSource && options.dataSource.length > 0) {
                dataLength = options.dataSource.length;
            }
            //找出第一个显示的div
            //步骤文字div
            var step_dom = this.element.find("li");
            //时间节点div
            for (var i = step_dom.length - 1, j = 0; i > j; i--) {
                //最右边已经是显示了；
                if (i == dataLength - 1 && $(step_dom[i]).css("display") == "list-item") {
                    fish.info('已移到最后');
                    break;
                }
                if ($(step_dom[i]).css("display") == "list-item") {
                    $(step_dom[i + 1]).show();
                    $(step_dom[i - (this.display_count - 1)]).hide();
                }
            }
        },
        /**
         * 重新加载数据
         * param datas 数据组
         * */
        reloadData: function(datas) {
            var that = this;
            this.element.empty();
            this.options.dataSource = datas;
            that.inita();
            that._resize();
        }
    });
})();