package com.group.partitioninterface.dto;


import com.group.partitioninterface.entity.User;

import java.io.Serializable;

public class LoginRespond implements Serializable
{
    private static final long serialVersionUID = 1L;
    //编码 -2工号不存在 -1 登录异常 0 成功 1 成功,使用默认密码需要用户修改密码
    private Integer code;
    //详细信息
    private String msg;
    //真实名称
    private String realName;
    //用户ID
    private String id;
    //工号
    private String loginName;
    //用户对象
    private User user;


    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public String getRealName() {
        return realName;
    }

    public void setRealName(String realName) {
        this.realName = realName;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLoginName() {
        return loginName;
    }

    public void setLoginName(String loginName) {
        this.loginName = loginName;
    }
}
