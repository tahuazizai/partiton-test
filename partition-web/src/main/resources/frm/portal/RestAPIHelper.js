/**
 * 封装fish.ajax, 自定义异常处理
 */
define([], function () {

    var callService = function (type, url, param, successCallback, errorCallback, isAsync) {
        //url = (webroot ? webroot : "") + (fish.restPrefix ? fish.restPrefix + "/" : "") + url;

        //var token = portal.appGlobal.get("_csrf");
       // var header = portal.appGlobal.get("_csrf_header");

        return fish.ajax({
            type: type,
            url: url,
            data: param ? JSON.stringify(param) : null,
            contentType: "application/json",
            async: (isAsync === false) ? false : true, // 是否异步传输，不传递该参数默认为true
            processData: false,
            cache: false,
            crossDomain: true,
            showError: false, // 不自动显示异常信息，使用自定义异常信息
            xhrFields: {
                withCredentials: true
            },
            success: function (ret) {
                if (successCallback && fish.isFunction(successCallback)) {
                    successCallback(ret);
                }
            },
            
			error : function(xhr, status, error) {
				// 调用者指定了异常处理函数
				if (errorCallback && fish.isFunction(errorCallback)) { 
					errorCallback(xhr, status, error);
					return;
				}
				$.unblockUI();
				if (xhr.responseText) {
                    var errorObj = {};
                    try {
                        errorObj = JSON.parse(xhr.responseText);
					} 
                    catch (e) {
                        // 什么也不做
					}
					if(errorObj.type === void(0)) {
                    	// 请求异常
                        console.error(xhr.responseText);
                        fish.error({
                            title: 'Ajax ' + status,
                            message: url + ' ' + error
                        });
					} 
					else if(errorObj.type==0){ //业务异常
						fish.warn(errorObj.code + " : " + (errorObj.description || errorObj.message));
					} 
					else { //系统异常
						if (errorObj.code == "S-SYS-00027") { //Session过期
		                    if (portal.appGlobal.get("currentStatus") != "sessionTimeOut") {
		                        portal.appGlobal.set("currentStatus", "sessionTimeOut");
		                    }
		                } 
						else if (errorObj.code == "FTF-BASE-00000" && !fish.isEmpty(errorObj.description)) { // FTF-BASE-00000对应 An unknown error,此时如果有错误description则使用description;
                            fish.error(errorObj.description);
                        }
						else {
							fish.error(errorObj.message);
						}
					}
	            } 
				else { // 请求异常
	            	console.error(xhr.responseText);
	            	fish.error({
	                    title: 'Ajax ' + status,
	                    message: url + ' ' + error
	                });
	            }
            }
        })
    };
    
//    // 用于GET请求，对象转码为URL参数
//    var parseParam = function(param, key) {
//    	var paramStr = "";
//    	if (param instanceof String || param instanceof Number || param instanceof Boolean) {
//    		paramStr += "&" + key + "=" + encodeURIComponent(param);
//    	}
//    	else{
//    		$.each(param,function(i) {
//    			var k= (key==null) ? i : key + (param instanceof Array ? "[" + i + "]" : "." + i);
//    			paramStr += '&' + parseParam(this, k);
//    		});
//    	}
//    	return paramStr.substr(1);
//    };

    /**
     * GET /users：返回资源对象的列表
     * GET /users/{id}：返回单个资源对象
     * POST /users：返回新生成的资源对象
     * PUT /users/{id}： 修改完整的资源对象
     * PATCH /users/{id}：修改资源对象的部分属性
     * DELETE /users/{id}：删除资源对象
     **/
    return {
        // 适用于不带请求对象的GET查询：ResetAPIHelper.get("/users/", function() {});
        get: function (url, successCallback, errorCallback, isAsync) {
            return callService("GET", encodeURI(url), null, successCallback, errorCallback, isAsync);
        },

        // 适用于带请求对象的GET查询：ResetAPIHelper.get("/users/", {userName: 'ADMIN'}, function() {});
        // 当传递一些含有嵌套对象、数组的对象作为参数时，请务必小心
        getBy: function (url, param, successCallback, errorCallback, isAsync) {
            var encodedURI = fish.isEmpty(param) ? encodeURI(url) : encodeURI(url) + "?" + $.param(param);
            return callService("GET", encodedURI, null, successCallback, errorCallback, isAsync);
        },

        remove: function (url, successCallback, errorCallback, isAsync) {
            return callService("DELETE", encodeURI(url), null, successCallback, errorCallback, isAsync);
        },

        removeBy: function (url, param, successCallback, errorCallback, isAsync) {
            return callService("DELETE", encodeURI(url), param, successCallback, errorCallback, isAsync);
        },

        post: function (url, param, successCallback, errorCallback, isAsync) {
            return callService("POST", encodeURI(url), param, successCallback, errorCallback, isAsync);
        },

        put: function (url, param, successCallback, errorCallback, isAsync) {
            return callService("PUT", encodeURI(url), param, successCallback, errorCallback, isAsync);
        },

        patch: function (url, param, successCallback, errorCallback, isAsync) {
            return callService("PATCH", encodeURI(url), param, successCallback, errorCallback, isAsync);
        }
    }
});
