define(function(){
    /**
     * @Author huang.lixing
     * @Date 2017/4/10 14:53
     * @Descriprion  js 端获取主数据统一分装
     */
    return {

        /**
         * @Author huang.lixing
         * @Date 2017/4/10 14:53
         * @params busiObjNbr：业务编码  propertyName： 属性名称 compontentId： 填充的主键ID或者class self： view自身对象
         * @Descriprion  js 端获取主数据统一分装
         */
        comboboxValues:function(busiObjNbr,propertyName,compontentId,self,defaultValue){
            fish.get("portal/DomainDataController/getValuesList.do?busiNbr="+busiObjNbr+"&propertyName="+propertyName, {},function (data) {
                if (data) {
                    if(defaultValue){

                    }else{
                        defaultValue = "";
                    }
                    self.$(compontentId).combobox({
                        dataSource: data,
                        value: defaultValue,
                        editable: false,
                        change: function (event) {
                            // var val = $('.js-man-level').combobox("value");
                        }
                    });
                }
            }.bind(this));


        },
        /**
         * @Author huang.lixing
         * @Date 2017/4/10 14:53
         * @params busiObjNbr：业务编码  propertyName： 属性名称
         * @Descriprion  通过名称获取值
         */
        getAttrValueByName: function(busiObjNbr,propertyName,attrValueName,success){
            fish.get("portal/DomainDataController/getAttrValueByName.do?busiNbr="+busiObjNbr+"&propertyName="+propertyName+"&attrValueName="+attrValueName, {},success);
        },

        /**
         * @Author huang.lixing
         * @Date 2017/4/10 14:53
         * @params busiObjNbr：业务编码  propertyName： 属性名称
         * @Descriprion  js 获取下拉列表
         */
        getAttrValues:function(busiObjNbr,propertyName,success){
            fish.get("portal/DomainDataController/getValuesList.do?busiNbr="+busiObjNbr+"&propertyName="+propertyName, {},success);

        },


        /**
         * @Author huang.lixing
         * @Date 2017/4/10 14:53
         * @params busiObjNbr：业务编码
         * @Descriprion  js 获取动态属性列表
         */
        getDanyPropertys:function(busiObjNbr,success){
            fish.get("portal/DomainDataController/getDanyPropertys.do?busiNbr="+busiObjNbr, {},success);
        }
    }
});