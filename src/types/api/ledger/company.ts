import type { PageDomain, BaseEntity } from "../common";

/** 保险公司配置分页查询参数 */
export interface CompanyQuejlParams extends PageDomain {
  /** 公司名称 */
  companyName?: string;
  /** 0停用 1启用 */
  status?: string;
}

/** 保险公司配置信息 */
export interface JonlinkInsuranceCompany extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 公司名称 */
  companyName?: string;
  /** 公司编码 */
  companyCode?: string;
  /** 默认联系人(冗余) */
  contactPerson?: string;
  /** 联系电话(冗余) */
  contactPhone?: string;
  /** 地址 */
  address?: string;
  /** 0停用 1启用 */
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
