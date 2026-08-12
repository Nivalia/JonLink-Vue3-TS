import type { PageDomain, BaseEntity } from "../common";

/** 联系人管理配置分页查询参数 */
export interface ContactQuejlParams extends PageDomain {
  /** 联系人姓名 */
  contactName?: string;
  /** 联系电话 */
  phone?: string;
  /** 状态 0停用 1启用 */
  status?: string;
}

/** 联系人管理配置信息 */
export interface JonlinkContactPerson extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 联系人姓名 */
  contactName?: string;
  /** 联系电话 */
  phone?: string;
  /** 微信号 */
  wechat?: string;
  /** 邮箱 */
  email?: string;
  /** 职务 */
  title?: string;
  /** 状态 0停用 1启用 */
  status?: string;
  /** 备注 */
  remark?: string;
  /** 创建者 */
  createBy?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新者 */
  updateBy?: string;
  /** 更新时间 */
  updateTime?: string;
}
