package com.group.partitioninterface.entity;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;
import java.util.Date;

@Table(name = "sys_user")
public class User implements Serializable {
    /**
     * 用户标识
     */
    @Id
    @Column(name = "USER_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String userId;

    /**
     * 登录帐号
     */
    @Column(name = "LOGIN_NAME")
    private String loginName;

    /**
     * 登录密码
     */
    @Column(name = "LOGIN_PASS")
    private String loginPass;

    /**
     * 用户名
     */
    @Column(name = "USER_NAME")
    private String userName;

    /**
     * 手机号
     */
    @Column(name = "MOBILE")
    private String mobile;

    /**
     * 电子邮箱
     */
    @Column(name = "EMAIL")
    private String email;

    /**
     * 组织标识
     */
    @Column(name = "ORG_ID")
    private Long orgId;

    /**
     * 备注信息
     */
    @Column(name = "REMARKS")
    private String remarks;

    /**
     * 创建人
     */
    @Column(name = "CREATE_BY")
    private String createBy;

    /**
     * 创建时间
     */
    @Column(name = "CREATE_DATE")
    private Date createDate;

    /**
     * 更新者
     */
    @Column(name = "UPDATE_BY")
    private String updateBy;

    /**
     * 更新时间
     */
    @Column(name = "UPDATE_DATE")
    private Date updateDate;

    /**
     * 删除标识。0：正常；1：已删除
     */
    @Column(name = "DEL_FLAG")
    private Byte delFlag;

    private static final long serialVersionUID = 1L;

    /**
     * 获取用户标识
     *
     * @return USER_ID - 用户标识
     */
    public String getUserId() {
        return userId;
    }

    /**
     * 设置用户标识
     *
     * @param userId 用户标识
     */
    public void setUserId(String userId) {
        this.userId = userId == null ? null : userId.trim();
    }

    /**
     * 获取登录帐号
     *
     * @return LOGIN_NAME - 登录帐号
     */
    public String getLoginName() {
        return loginName;
    }

    /**
     * 设置登录帐号
     *
     * @param loginName 登录帐号
     */
    public void setLoginName(String loginName) {
        this.loginName = loginName == null ? null : loginName.trim();
    }

    /**
     * 获取登录密码
     *
     * @return LOGIN_PASS - 登录密码
     */
    public String getLoginPass() {
        return loginPass;
    }

    /**
     * 设置登录密码
     *
     * @param loginPass 登录密码
     */
    public void setLoginPass(String loginPass) {
        this.loginPass = loginPass == null ? null : loginPass.trim();
    }

    /**
     * 获取用户名
     *
     * @return USER_NAME - 用户名
     */
    public String getUserName() {
        return userName;
    }

    /**
     * 设置用户名
     *
     * @param userName 用户名
     */
    public void setUserName(String userName) {
        this.userName = userName == null ? null : userName.trim();
    }

    /**
     * 获取手机号
     *
     * @return MOBILE - 手机号
     */
    public String getMobile() {
        return mobile;
    }

    /**
     * 设置手机号
     *
     * @param mobile 手机号
     */
    public void setMobile(String mobile) {
        this.mobile = mobile == null ? null : mobile.trim();
    }

    /**
     * 获取电子邮箱
     *
     * @return EMAIL - 电子邮箱
     */
    public String getEmail() {
        return email;
    }

    /**
     * 设置电子邮箱
     *
     * @param email 电子邮箱
     */
    public void setEmail(String email) {
        this.email = email == null ? null : email.trim();
    }

    /**
     * 获取组织标识
     *
     * @return ORG_ID - 组织标识
     */
    public Long getOrgId() {
        return orgId;
    }

    /**
     * 设置组织标识
     *
     * @param orgId 组织标识
     */
    public void setOrgId(Long orgId) {
        this.orgId = orgId;
    }

    /**
     * 获取备注信息
     *
     * @return REMARKS - 备注信息
     */
    public String getRemarks() {
        return remarks;
    }

    /**
     * 设置备注信息
     *
     * @param remarks 备注信息
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
     * 获取创建时间
     *
     * @return CREATE_DATE - 创建时间
     */
    public Date getCreateDate() {
        return createDate;
    }

    /**
     * 设置创建时间
     *
     * @param createDate 创建时间
     */
    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    /**
     * 获取更新者
     *
     * @return UPDATE_BY - 更新者
     */
    public String getUpdateBy() {
        return updateBy;
    }

    /**
     * 设置更新者
     *
     * @param updateBy 更新者
     */
    public void setUpdateBy(String updateBy) {
        this.updateBy = updateBy == null ? null : updateBy.trim();
    }

    /**
     * 获取更新时间
     *
     * @return UPDATE_DATE - 更新时间
     */
    public Date getUpdateDate() {
        return updateDate;
    }

    /**
     * 设置更新时间
     *
     * @param updateDate 更新时间
     */
    public void setUpdateDate(Date updateDate) {
        this.updateDate = updateDate;
    }

    /**
     * 获取删除标识。0：正常；1：已删除
     *
     * @return DEL_FLAG - 删除标识。0：正常；1：已删除
     */
    public Byte getDelFlag() {
        return delFlag;
    }

    /**
     * 设置删除标识。0：正常；1：已删除
     *
     * @param delFlag 删除标识。0：正常；1：已删除
     */
    public void setDelFlag(Byte delFlag) {
        this.delFlag = delFlag;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(getClass().getSimpleName());
        sb.append(" [");
        sb.append("Hash = ").append(hashCode());
        sb.append(", userId=").append(userId);
        sb.append(", loginName=").append(loginName);
        sb.append(", loginPass=").append(loginPass);
        sb.append(", userName=").append(userName);
        sb.append(", mobile=").append(mobile);
        sb.append(", email=").append(email);
        sb.append(", orgId=").append(orgId);
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