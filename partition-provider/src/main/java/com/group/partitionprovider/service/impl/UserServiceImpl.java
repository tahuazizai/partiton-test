package com.group.partitionprovider.service.impl;


import com.alibaba.dubbo.config.annotation.Service;
import com.group.partitionDao.dao.UserMapper;
import com.group.partitioninterface.entity.User;
import com.group.partitioninterface.service.UserService;
import com.group.partitionprovider.service.impl.base.BaseServiceImpl;
import lombok.extern.log4j.Log4j;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * @ClassName UserServiceImpl
 * @description 用户服务
 * @date 2020/1/9
 */
@Service(version = "0.0.1")
@Log4j
public class UserServiceImpl extends BaseServiceImpl<User> implements UserService {

    @Autowired
    private UserMapper userMapper;



    @Override
    public int addUser(User user) {
        userMapper.insert(user);
        return 1;
    }
}
