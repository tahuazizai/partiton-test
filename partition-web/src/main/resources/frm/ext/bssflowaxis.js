/*
 * 垂直流程轴用parentID
 * */
(function() {
    "use strict";
    //流程轴的容器
    var flow_container = '<ul class="flowaxis"></ul>';

    /*
    * 顶级元素才用到
    * primary-state 蓝色（当前处理中）
    * success-state 绿色(成功通过) (默认)
    * warning-state 黄色(出现问题)
    * error-state 红色（否决）
    * */
    //每个流程的容器
    var flow_item_container = '' +
        '<li class="flowaxis-item row">' +
            '<div class="col-sm-2 flowaxis-item-col">'+
                '<div class="flowaxis-item-title">'+
                    '<div class="flowaxis-item-num-dot success-state"></div>'+
                    '<span class="flowaxis-item-span-widget"></span>'+
                '</div>'+
            '</div>' +
            '<div class="col-sm-10 flowaxis-item-col">'+
                '<div class="flowaxis-item-main">'+
                '</div>'+
            '</div>'+
        '</li>';

    //每个流程审批节点审批
    var flow_item_approve_content = '<div class="flowaxis-item-content" name="content">'+
        '<div class="flowaxis-item-heading">'+
        '<span class="flowaxis-text-title-widget"></span>'+
        '<span class="text-primary"></span>'+
        '<span class="pull-right flowaxis-item-tools"></span></div>'+
        '<div class="flowaxis-item-body"></div>'+
        '</div>';

    //每个流程审批节点的回复
    var flow_item_approve_reply = '<div class="flowaxis-item-reply"></div>';

    //流程审批节点的回复的节点审批内容
    var flow_item_reply_content = '<div class="flowaxis-item-content">'+
        '<div class="flowaxis-item-heading">'+
        '<span class="flowaxis-text-title-widget"></span>'+
        '<span class="text-primary"></span>'+
        '<span class="pull-right flowaxis-item-tools"></span></div>'+
        '<div class="flowaxis-item-body"></div>'+
        '</div>';

    var  NotParentNodes = [];//储存非顶级对象
    var templateNodes = [];//用来储存顶级节点
    $.widget('ui.bssflowaxis',{
        //外面传入参数(第一层只能一层)
        options: {
            dataSource : []//流程数
        },
        //创建控件方法
        _create : function(){
            this._initWidget();
        },
        //初始化方法
        _initWidget : function(){

            var options = this.options;
            //流程总数
            this.flowLength = 0;
            if (options.dataSource && options.dataSource.length > 0) {
                this.flowLength = options.dataSource.length;
            }
            var ulEle = $(flow_container);

            var root = {
                id : '-1',
                hasChild : false,
                ls : false
            };
            //添加顶级节点
            this._addTopNodes(ulEle,this.flowLength);
            for(var i=0;i<templateNodes.length;i++){
                //添加节点
                this._addNodes(ulEle,NotParentNodes,templateNodes[i]);
            }

            //添加流程轴容器
            this.element.append(ulEle);
            NotParentNodes = [];
            templateNodes = [];
        },

        _addTopNodes : function(ulEle,flowLength){
            var options = this.options;
            // var count = 0;//记录父元素的个数
            var li_count = 0;//记录顶级元素
            //先将根元素添加到ulEle

            for(var i=0;i<flowLength;i++){
                var pid = options.dataSource[i].pid;
                if(pid == '-1'){
                    //如果等于-1是根节点;
                    ulEle.append(flow_item_container);
                    //为li添加数据的id属性
                    ulEle.find('li').eq(li_count).attr("id",options.dataSource[i].id + "_li");
                    ulEle.find('.flowaxis-item-main').eq(li_count).attr("id",options.dataSource[i].id + "_itemMain");

                    var data = options.dataSource[i];
                    var itemNum = options.dataSource[i].itemNum;
                    if(itemNum == undefined || itemNum == null){
                        itemNum = " ";
                    }
                    var itemName = options.dataSource[i].itemName;
                    if(itemName == undefined || itemName == null){
                        itemName = " ";
                    }
                    var itemHeading = data.itemHeading;
                    if(itemHeading == undefined || itemHeading == null){
                        itemHeading = " ";
                    }
                    var itemTextPrimary = data.itemTextPrimary;
                    if(itemTextPrimary == undefined || itemTextPrimary == null){
                        itemTextPrimary = " ";
                    }
                    var itemTime = options.dataSource[i].itemTime;
                    if(itemTime == undefined || itemTime == null){
                        itemTime = " ";
                    }
                    var itemBody = options.dataSource[i].itemBody;
                    if(itemBody == undefined || itemBody == null){
                        itemBody = " ";
                    }

                    //添加左边根元素数据
                    ulEle.find('.flowaxis-item-num-dot:eq('+li_count+')').text(itemNum);
                    //流程球添加样式 flowaxis-item-num-dot
                    /*
                    * primary-state 蓝色（当前处理中）success-state
                    * success-state 绿色(成功通过) (默认) pass
                    * warning-state 黄色(出现问题) warning-state
                    * error-state 红色（否决） reject
                    */
                    var dotElement = ulEle.find('.flowaxis-item-num-dot:eq('+li_count+')');
                    var dot_style = options.dataSource[i].flowState;
                    if(dot_style){
                        dotElement.removeClass('success-state');
                        if(dot_style == 'pass'){//通过
                            dotElement.addClass('success-state');
                        } else if(dot_style == 'handle'){//处理中
                            dotElement.addClass('primary-state');
                        } else if(dot_style == 'warning'){//出现问题
                            dotElement.addClass('warning-state');
                        } else if(dot_style == 'reject'){//否决
                            dotElement.addClass('error-state');
                        }
                    }

                    ulEle.find('.flowaxis-item-span-widget:eq('+li_count+')').text(itemName);
                    //右边子流程添加content
                    ulEle.find('.flowaxis-item-main').eq(li_count).append(flow_item_approve_content);
                    ulEle.find('.flowaxis-item-content').eq(li_count).attr("id",options.dataSource[i].id + "_itemContent");
                    //添加右边根元素数据
                    ulEle.find('.flowaxis-item-main').eq(li_count).find('.flowaxis-item-content[name="content"]').eq(0).find('.flowaxis-text-title-widget').eq(0).text(itemHeading);
                    ulEle.find('.flowaxis-item-main').eq(li_count).find('.flowaxis-item-content[name="content"]').eq(0).find('.text-primary').eq(0).text(itemTextPrimary);
                    ulEle.find('.flowaxis-item-main').eq(li_count).find('.flowaxis-item-content[name="content"]').eq(0).find('.flowaxis-item-tools').eq(0).text(itemTime);
                    ulEle.find('.flowaxis-item-main').eq(li_count).find('.flowaxis-item-content[name="content"]').eq(0).find('.flowaxis-item-body').eq(0).text(itemBody);

                    templateNodes.push(options.dataSource[i]);//储存顶级节点
                    li_count++;
                } else {
                    NotParentNodes.push(options.dataSource[i]);
                }
            }
            li_count = 0;
        },

        /**
         * 渲染元素
         * */
        _createNode : function(ulEle,NotParentNodes,currentNode,n){
            var pid = currentNode.pid;
            //查找父元素的li
            var itemContentEle =  ulEle.find('#'+pid+"_itemContent");
            //给reply添加id
            var flow_item_approve_reply_hasId = $(flow_item_approve_reply).attr("id",currentNode.id + "_reply");

            //给reply元素添加id
            var flow_item_reply_content_hasId = $(flow_item_reply_content).attr("id",currentNode.id + "_itemContent");
            //给reply元素添加content元素
            flow_item_approve_reply_hasId.append(flow_item_reply_content_hasId);
            //插入兄弟节点
            flow_item_approve_reply_hasId.insertAfter(itemContentEle);

            var itemHeading = currentNode.itemHeading;
            if(itemHeading == undefined || itemHeading == null){
                itemHeading = " ";
            }
            var itemTextPrimary = currentNode.itemTextPrimary;
            if(itemTextPrimary == undefined || itemTextPrimary == null){
                itemTextPrimary = " ";
            }
            var itemTime = currentNode.itemTime;
            if(itemTime == undefined || itemTime == null){
                itemTime = " ";
            }
            var itemBody = currentNode.itemBody;
            if(itemBody == undefined || itemBody == null){
                itemBody = " ";
            }

            ulEle.find("#"+ currentNode.id + "_itemContent").find('.flowaxis-text-title-widget').eq(0).text(itemHeading);
            ulEle.find("#"+ currentNode.id + "_itemContent").find('.text-primary').eq(0).text(itemTextPrimary);
            ulEle.find("#"+ currentNode.id + "_itemContent").find('.flowaxis-item-tools').eq(0).text(itemTime);
            ulEle.find("#"+ currentNode.id + "_itemContent").find('.flowaxis-item-body').eq(0).text(itemBody);

            this._addNodes(ulEle,NotParentNodes,currentNode);
        },

        /**
         * 添加节点
         * ulEle：ul根元素jq对象；
         * flowLength：传入的数组长度
         */
        _addNodes : function(ulEle,NotParentNodes,templateNode){
            var n = 0;
            var notParentNodesLength = NotParentNodes.length;
            for(n;n<notParentNodesLength;n++){
                var pid = NotParentNodes[n].pid;
                if(pid == templateNode.id){
                    //把遍历出来的对象的数据赋值给currentNode
                    var currentNode = NotParentNodes[n];
                    //父节点的对象给_p属性
                    currentNode._p = templateNode;
                    currentNode._ai = n;
                    //检查是否有子元素和是否是最后一个元素
                    this._checkIsHaveChildAndLast(currentNode,NotParentNodes);
                    //渲染元素
                    this._createNode(ulEle,NotParentNodes,currentNode,n);

                    if(currentNode.ls){
                        break;
                    }
                }
            }
        },

        /**
         * 检查是否有子元素和是否是最后一个元素
         * */
        _checkIsHaveChildAndLast : function(currentNode,NotParentNodes){
            // var options = this.options;
            var lastId;
            for(var n=0;n<NotParentNodes.length;n++){
                if(NotParentNodes[n].pid == currentNode.id){
                    currentNode.hasChild = true;
                }
                if(NotParentNodes[n].pid == currentNode.pid){
                    lastId = NotParentNodes[n].id;
                }
            }
            if(lastId == currentNode.id){
                currentNode.ls = true;
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
            that._initWidget();
        }
    });
})();
















