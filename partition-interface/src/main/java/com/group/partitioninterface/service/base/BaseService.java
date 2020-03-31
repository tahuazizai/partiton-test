package com.group.partitioninterface.service.base;

import com.github.pagehelper.PageInfo;
import com.group.partitioninterface.entity.GridQo;
import tk.mybatis.mapper.common.ConditionMapper;
import tk.mybatis.mapper.common.ExampleMapper;
import tk.mybatis.mapper.common.IdsMapper;
import tk.mybatis.mapper.common.MySqlMapper;


public interface BaseService<T> extends tk.mybatis.mapper.common.BaseMapper<T>, MySqlMapper<T>, IdsMapper<T>, ConditionMapper<T>,ExampleMapper<T> {
    PageInfo<T> selectGridData(GridQo var1);
}
