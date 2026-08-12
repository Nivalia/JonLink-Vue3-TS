import type { PageDomain, BaseEntity } from "../common";

/** 产品管理配置分页查询参数 */
export interface ProductQuejlParams extends PageDomain {
  /** 产品名称 */
  productName?: string;
  /** 险别ID(引用) */
  typeId?: number;
  /** 上下架 0下架 1上架 */
  shelfStatus?: string;
}

/** 产品管理配置信息 */
export interface JonlinkProduct extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 产品名称 */
  productName?: string;
  /** 保险公司ID(引用) */
  companyId?: number;
  /** 保险公司名称(带出冗余) */
  companyName?: string;
  /** 负责人ID(引用联系人) */
  contactId?: number;
  /** 负责人(冗余) */
  contactName?: string;
  /** 联系电话(带出) */
  contactPhone?: string;
  /** 险别ID(引用) */
  typeId?: number;
  /** 险别名称(冗余) */
  typeName?: string;
  /** 上游渠道(带出台账) */
  upChannel?: string;
  /** 上游专属返利% */
  upRate?: string;
  /** 下游专属返利% */
  downRate?: string;
  /** 是否扣税 0否 1是(保费/1.06计算) */
  deductTax?: string;
  /** 上下架 0下架 1上架 */
  shelfStatus?: string;
  /** 排序 */
  sort?: number;
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
