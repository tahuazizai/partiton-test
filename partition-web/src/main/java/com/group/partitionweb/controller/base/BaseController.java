package com.group.partitionweb.controller.base;

import com.github.pagehelper.PageInfo;

import com.group.partitioninterface.dto.KeyObject;
import com.group.partitioninterface.entity.GridQo;
import com.group.partitioninterface.service.base.BaseService;

import com.group.partitionweb.utils.RSAUtils;
import lombok.extern.log4j.Log4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @ClassName BaseController
 * @description 基类
 * @date 2020/1/2
 */
@Log4j
public class BaseController<T> {

    public static Map<String, KeyObject> keyMaps = new HashMap<String, KeyObject>();

    @Autowired(required = false)
    private BaseService<T> baseService;

    @PostMapping("/create")
    public T create(@RequestBody T entity) {
        int count = this.baseService.insert(entity);
        return entity;
    }

    @PostMapping("/getById/{id}")
    public T get(@PathVariable Long id) {
        T entity = this.baseService.selectByPrimaryKey(id);
        if (entity == null) {
            throw new RuntimeException("没有找到对应实体");
        } else {
            return entity;
        }
    }

    @DeleteMapping("/deleteById/{id}")
    public int delete(@PathVariable Long id) {
        return this.baseService.deleteByPrimaryKey(id);
    }

    @PutMapping("/updateById")
    public int update(@RequestBody T entity) {
        return this.baseService.updateByPrimaryKeySelective(entity);
    }

    @GetMapping("/selectAll")
    public List<T> selectAll() {
        return this.baseService.selectAll();
    }

    @PostMapping("/selectList")
    public List<T> selectList(@RequestBody T query) {
        return this.baseService.select(query);
    }

    @PostMapping("/selectGridData")
    public PageInfo<T> selectGridData(@RequestBody GridQo query) {
        return this.baseService.selectGridData(query);
    }

    public static HttpSession getHttpSession() {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        HttpSession session = request.getSession();
        return session;
    }


    public  void generateKeys(String userKey) {
        HashMap<String, Object> keyMap ;
        try {
            keyMap = RSAUtils.getKeys();
            RSAPublicKey publicKey = (RSAPublicKey) keyMap.get("public"); //公钥
            RSAPrivateKey privateKey = (RSAPrivateKey) keyMap.get("private");//私钥
            String modulus = publicKey.getModulus().toString(16);
            String publicExponent = publicKey.getPublicExponent().toString(16);
            String privateExponent = privateKey.getPrivateExponent().toString();
            KeyObject keyObject = new KeyObject();
            keyObject.setModulus(modulus);
            keyObject.setPublicExponent(publicExponent);
            keyObject.setPrivateExponent(privateExponent);
            keyObject.setPrivateKey(privateKey);
            keyMaps.put(userKey, keyObject);
        } catch (NoSuchAlgorithmException e) {
            log.error("获取密钥失败",e);
        }
    }
}
