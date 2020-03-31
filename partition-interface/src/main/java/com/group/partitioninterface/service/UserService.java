package com.group.partitioninterface.service;


import com.group.partitioninterface.entity.User;
import com.group.partitioninterface.service.base.BaseService;

/**
 * @ClassName UserService
 * @description 用户服务接口
 * @date 2020/1/9
 */
public interface UserService extends BaseService<User> {
    int addUser(User user);
}
