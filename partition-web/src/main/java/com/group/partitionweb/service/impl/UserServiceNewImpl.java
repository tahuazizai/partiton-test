package com.group.partitionweb.service.impl;

import com.alibaba.dubbo.config.annotation.Reference;
import com.group.partitioninterface.entity.User;
import com.group.partitioninterface.service.UserService;
import com.group.partitionweb.service.UserNewService;
import org.springframework.stereotype.Service;

/**
 * @ClassName UserServiceNewImpl
 * @description yongh
 * @date 2020/3/31
 */
@Service
public class UserServiceNewImpl  implements UserNewService {
    @Reference(version="0.0.1")
    private UserService userService;
    @Override
    public int addUser(User user) {
        return this.userService.addUser(user);
    }
}
