package com.group.partitioninterface.entity;

import com.ssm.group.entity.base.BaseEntity;
import java.io.Serializable;
import java.util.Date;
import javax.persistence.*;

@Table(name = "sys_menu")
public class SysMenu extends BaseEntity implements Serializable {
    /**
     * 菜单ID
     */
    @Id
    @Column(name = "MENU_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String menuId;

    /**
     * 父菜单ID
     */
    @Column(name = "PARENT_ID")
    private String parentId;

    /**
     * 菜单名称
     */
    @Column(name = "NAME")
    private String name;

    /**
     * 层级
     */
    @Column(name = "MENU_LEVEL")
    private Integer menuLevel;

    /**
     * 菜单链接
     */
    @Column(name = "HREF")
    private String href;

    /**
     * 授权。(多个用逗号分隔，如：user:list,user:create)
     */
    @Column(name = "PERM_CODE")
    private String permCode;

    /**
     * 目标
     */
    @Column(name = "TARGET")
    private String target;

    /**
     * 类型。   0：目录，1：菜单，2：按钮，3：其他
     */
    @Column(name = "TYPE")
    private Integer type;

    /**
     * 菜单图标
     */
    @Column(name = "ICON")
    private String icon;

    /**
     * 排序
     */
    @Column(name = "SEQ_NUM")
    private Integer seqNum;

    /**
     * 租户模式。0：非租户模式.。1：租户
     */
    @Column(name = "RENT_MODE")
    private Short rentMode;

    /**
     * 状态。 0：隐藏   1：显示
     */
    @Column(name = "STATUS")
    private Integer status;

    /**
     * 描述
     */
    @Column(name = "REMARKS")
    private String remarks;

    /**
     * 创建人
     */
    @Column(name = "CREATE_BY")
    private String createBy;

    @Column(name = "CREATE_DATE")
    private Date createDate;

    /**
     * 更新人
     */
    @Column(name = "UPDATE_BY")
    private String updateBy;

    @Column(name = "UPDATE_DATE")
    private Date updateDate;

    /**
     * 删除标识。0：正常，1：删除
     */
    @Column(name = "DEL_FLAG")
    private Integer delFlag;

    private static final long serialVersionUID = 1L;

    /**
     * 获取菜单ID
     *
     * @return MENU_ID - 菜单ID
     */
    public String getMenuId() {
        return menuId;
    }

    /**
     * 设置菜单ID
     *
     * @param menuId 菜单ID
     */
    public void setMenuId(String menuId) {
        this.menuId = menuId == null ? null : menuId.trim();
    }

    /**
     * 获取父菜单ID
     *
     * @return PARENT_ID - 父菜单ID
     */
    public String getParentId() {
        return parentId;
    }

    /**
     * 设置父菜单ID
     *
     * @param parentId 父菜单ID
     */
    public void setParentId(String parentId) {
        this.parentId = parentId == null ? null : parentId.trim();
    }

    /**
     * 获取菜单名称
     *
     * @return NAME - 菜单名称
     */
    public String getName() {
        return name;
    }

    /**
     * 设置菜单名称
     *
     * @param name 菜单名称
     */
    public void setName(String name) {
        this.name = name == null ? null : name.trim();
    }

    /**
     * 获取层级
     *
     * @return MENU_LEVEL - 层级
     */
    public Integer getMenuLevel() {
        return menuLevel;
    }

    /**
     * 设置层级
     *
     * @param menuLevel 层级
     */
    public void setMenuLevel(Integer menuLevel) {
        this.menuLevel = menuLevel;
    }

    /**
     * 获取菜单链接
     *
     * @return HREF - 菜单链接
     */
    public String getHref() {
        return href;
    }

    /**
     * 设置菜单链接
     *
     * @param href 菜单链接
     */
    public void setHref(String href) {
        this.href = href == null ? null : href.trim();
    }

    /**
     * 获取授权。(多个用逗号分隔，如：user:list,user:create)
     *
     * @return PERM_CODE - 授权。(多个用逗号分隔，如：user:list,user:create)
     */
    public String getPermCode() {
        return permCode;
    }

    /**
     * 设置授权。(多个用逗号分隔，如：user:list,user:create)
     *
     * @param permCode 授权。(多个用逗号分隔，如：user:list,user:create)
     */
    public void setPermCode(String permCode) {
        this.permCode = permCode == null ? null : permCode.trim();
    }

    /**
     * 获取目标
     *
     * @return TARGET - 目标
     */
    public String getTarget() {
        return target;
    }

    /**
     * 设置目标
     *
     * @param target 目标
     */
    public void setTarget(String target) {
        this.target = target == null ? null : target.trim();
    }

    /**
     * 获取类型。   0：目录，1：菜单，2：按钮，3：其他
     *
     * @return TYPE - 类型。   0：目录，1：菜单，2：按钮，3：其他
     */
    public Integer getType() {
        return type;
    }

    /**
     * 设置类型。   0：目录，1：菜单，2：按钮，3：其他
     *
     * @param type 类型。   0：目录，1：菜单，2：按钮，3：其他
     */
    public void setType(Integer type) {
        this.type = type;
    }

    /**
     * 获取菜单图标
     *
     * @return ICON - 菜单图标
     */
    public String getIcon() {
        return icon;
    }

    /**
     * 设置菜单图标
     *
     * @param icon 菜单图标
     */
    public void setIcon(String icon) {
        this.icon = icon == null ? null : icon.trim();
    }

    /**
     * 获取排序
     *
     * @return SEQ_NUM - 排序
     */
    public Integer getSeqNum() {
        return seqNum;
    }

    /**
     * 设置排序
     *
     * @param seqNum 排序
     */
    public void setSeqNum(Integer seqNum) {
        this.seqNum = seqNum;
    }

    /**
     * 获取租户模式。0：非租户模式.。1：租户
     *
     * @return RENT_MODE - 租户模式。0：非租户模式.。1：租户
     */
    public Short getRentMode() {
        return rentMode;
    }

    /**
     * 设置租户模式。0：非租户模式.。1：租户
     *
     * @param rentMode 租户模式。0：非租户模式.。1：租户
     */
    public void setRentMode(Short rentMode) {
        this.rentMode = rentMode;
    }

    /**
     * 获取状态。 0：隐藏   1：显示
     *
     * @return STATUS - 状态。 0：隐藏   1：显示
     */
    public Integer getStatus() {
        return status;
    }

    /**
     * 设置状态。 0：隐藏   1：显示
     *
     * @param status 状态。 0：隐藏   1：显示
     */
    public void setStatus(Integer status) {
        this.status = status;
    }

    /**
     * 获取描述
     *
     * @return REMARKS - 描述
     */
    public String getRemarks() {
        return remarks;
    }

    /**
     * 设置描述
     *
     * @param remarks 描述
     */
    public void setRemarks(String remarks) {
        this.remarks = remarks == null ? null : remarks.trim();
    }

    /**
     * 获取创建人
     *
     * @return CREATE_BY - 创建人
     */
    public String getCreateBy() {
        return createBy;
    }

    /**
     * 设置创建人
     *
     * @param createBy 创建人
     */
    public void setCreateBy(String createBy) {
        this.createBy = createBy == null ? null : createBy.trim();
    }

    /**
     * @return CREATE_DATE
     */
    public Date getCreateDate() {
        return createDate;
    }

    /**
     * @param createDate
     */
    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    /**
     * 获取更新人
     *
     * @return UPDATE_BY - 更新人
     */
    public String getUpdateBy() {
        return updateBy;
    }

    /**
     * 设置更新人
     *
     * @param updateBy 更新人
     */
    public void setUpdateBy(String updateBy) {
        this.updateBy = updateBy == null ? null : updateBy.trim();
    }

    /**
     * @return UPDATE_DATE
     */
    public Date getUpdateDate() {
        return updateDate;
    }

    /**
     * @param updateDate
     */
    public void setUpdateDate(Date updateDate) {
        this.updateDate = updateDate;
    }

    /**
     * 获取删除标识。0：正常，1：删除
     *
     * @return DEL_FLAG - 删除标识。0：正常，1：删除
     */
    public Integer getDelFlag() {
        return delFlag;
    }

    /**
     * 设置删除标识。0：正常，1：删除
     *
     * @param delFlag 删除标识。0：正常，1：删除
     */
    public void setDelFlag(Integer delFlag) {
        this.delFlag = delFlag;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(getClass().getSimpleName());
        sb.append(" [");
        sb.append("Hash = ").append(hashCode());
        sb.append(", menuId=").append(menuId);
        sb.append(", parentId=").append(parentId);
        sb.append(", name=").append(name);
        sb.append(", menuLevel=").append(menuLevel);
        sb.append(", href=").append(href);
        sb.append(", permCode=").append(permCode);
        sb.append(", target=").append(target);
        sb.append(", type=").append(type);
        sb.append(", icon=").append(icon);
        sb.append(", seqNum=").append(seqNum);
        sb.append(", rentMode=").append(rentMode);
        sb.append(", status=").append(status);
        sb.append(", remarks=").append(remarks);
        sb.append(", createBy=").append(createBy);
        sb.append(", createDate=").append(createDate);
        sb.append(", updateBy=").append(updateBy);
        sb.append(", updateDate=").append(updateDate);
        sb.append(", delFlag=").append(delFlag);
        sb.append("]");
        return sb.toString();
    }
}