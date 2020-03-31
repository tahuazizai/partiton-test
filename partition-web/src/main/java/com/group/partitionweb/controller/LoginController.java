package com.group.partitionweb.controller;


import com.alibaba.dubbo.config.annotation.Reference;
import com.group.partitioninterface.dto.KeyObject;
import com.group.partitioninterface.dto.LoginRespond;
import com.group.partitioninterface.dto.LoginSession;
import com.group.partitioninterface.entity.User;
import com.group.partitioninterface.service.UserService;
import com.group.partitionweb.controller.base.BaseController;
import com.group.partitionweb.service.UserNewService;
import com.group.partitionweb.utils.RSAUtils;
import com.group.partitionweb.utils.SecurityPassword;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.security.interfaces.RSAPrivateKey;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @ClassName LoginController
 * @description 登录控制
 * @date 2020/1/2
 */
@RestController
@RequestMapping("/gmms/login")
public class LoginController extends BaseController<User> {

    @Reference(version="0.0.1")
    private UserService userService;
    @GetMapping("/ifHasLogin")
    public LoginSession ifHasLogin() {
        HttpSession session = getHttpSession();
        LoginSession loginSession = (LoginSession) session.getAttribute("LoginSession");
        return loginSession == null ? new LoginSession() : loginSession;
    }

    @GetMapping("/loadPublicKey/{username}")
    public Map loadPublicKey(@PathVariable String username) {
        Map resultMap = new HashMap();
        if (username != null && !"".equals(username)) {
            generateKeys(username);
        }
        KeyObject keyObject = keyMaps.get(username);
        if (keyObject != null) {
            resultMap.put("modulus", keyObject.getModulus());
            resultMap.put("publicExponent", keyObject.getPublicExponent());
        }

        return resultMap;
    }

    @GetMapping("/loginOut")
    public boolean loginOut() {
       getHttpSession().invalidate();
        return true;
    }

    @GetMapping("/addUserInfo")
    public int addUserInfo(){
        User user = new User();
        Date date = new Date();
        user.setLoginName("321");
        user.setCreateBy("小明");
        user.setUpdateBy("小明");
        user.setCreateDate(date);
        user.setUpdateDate(date);
        user.setDelFlag((byte) 1);
        user.setEmail("lsj@163.com");
        user.setLoginPass("321");
        user.setMobile("15270893689");
        user.setOrgId(1L);
        user.setUserId("7896");
        user.setUserName("小明");
        return this.userService.addUser(user);
    }

    @PostMapping("/loginIn")
    public LoginRespond loginIn(@RequestBody HashMap requestMap) throws Exception{
        Map<String,Object> map = new HashMap<>();
        String username = (String) requestMap.get("userCode");
        String password = (String) requestMap.get("password");
        KeyObject keyObject = keyMaps.get(username);
        if (keyObject != null) {
            RSAPrivateKey privateKey = keyObject.getPrivateKey();
            password = new StringBuffer(RSAUtils.decryptByPrivateKey(password, privateKey)).reverse().toString();
            keyMaps.remove(username);
        }
        User user = new User();
        user.setLoginName(username);
        List<User> userList = this.userService.select(user);
        LoginRespond returnRespond = new LoginRespond();
        if (userList.size() <= 0) {
            returnRespond.setCode(-2);
            returnRespond.setMsg("用户工号不存在!");
            return returnRespond;
        } else {
            user = userList.get(0);
            int state = user.getDelFlag();
            String tpassword = user.getLoginPass();
            if ("1".equals(state)) {//0正常，1正常
                returnRespond.setCode(-1);
                returnRespond.setMsg("工号已失效，请与管理员联系!!");
            } else if (!encrypt(password).equals(tpassword)) {
                returnRespond.setCode(-1);
                returnRespond.setMsg("密码有误，请重新输入!");
            }
            returnRespond.setCode(0);
            returnRespond.setUser(user);

        }
        if(returnRespond.getCode()==0 || returnRespond.getCode()==1){
            HttpSession hsession = getHttpSession();
            LoginSession loginSession = setSession(returnRespond.getUser());
            hsession.setAttribute("LoginSession", loginSession);
            returnRespond.setRealName(returnRespond.getUser().getUserName());
            returnRespond.setId(returnRespond.getUser().getLoginName());
            returnRespond.setLoginName(returnRespond.getUser().getUserId());
        }else{
            returnRespond.setUser(new User());
        }
        return returnRespond;
    }
    private LoginSession setSession(User user) {
        LoginSession session = new LoginSession();
        session.setUser(user);
        return session;
    }
    /**
     * 密码使用MD5加密存储
     * @param password
     * @return
     */
    private String encrypt(String password){
        return SecurityPassword.getDigestPasswd(password);
    }
}
