import type { PageDomain, BaseEntity } from "../common";

/** 公司联系人配置分页查询参数 */
export interface CompanyContactQuejlParams extends PageDomain {
  /** 公司ID */
  companyId?: number;
  /** 联系人ID */
  contactId?: number;
}

/** 公司联系人配置信息 */
export interface JonlinkCompanyContact extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 公司ID */
  companyId?: number;
  /** 联系人ID */
  contactId?: number;
  /** 是否主联系人 0否 1是 */
  isPrimary?: string;
  /** 关系状态 0停用 1启用 */
  status?: string;
  /** 创建时间 */
  createTime?: string;
  /** 创建者 */
  createBy?: string;
}
