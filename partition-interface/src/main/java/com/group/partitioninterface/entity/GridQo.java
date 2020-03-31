package com.group.partitioninterface.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.util.Map;

/**
 * @ClassName GridQo
 * @description 分页参数
 * @date 2020/1/4
 */
@Data
@EqualsAndHashCode
public class GridQo implements Serializable {
    private static final long serialVersionUID = 1L;
    private Map<String, Object> anyProperties;
    private String filterCol;
    private String filterVal;
    private Integer pageNum;
    private Integer pageSize;
    private String sortName;
    private String sortOrder;
}
