package com.group.partitionDao.baseDao;

import org.apache.ibatis.annotations.Mapper;
import tk.mybatis.mapper.common.ConditionMapper;
import tk.mybatis.mapper.common.ExampleMapper;
import tk.mybatis.mapper.common.IdsMapper;
import tk.mybatis.mapper.common.MySqlMapper;

/**
 * @ClassName MyBaseMapper
 * @description
 * @date 2020/3/30
 */

public interface MyBaseMapper<T> extends tk.mybatis.mapper.common.BaseMapper<T>, MySqlMapper<T>, IdsMapper<T>, ConditionMapper<T>, ExampleMapper<T> {
}
