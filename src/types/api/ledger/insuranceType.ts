import type { PageDomain, BaseEntity } from "../common";

/** 险种管理配置分页查询参数 */
export interface InsuranceTypeQuejlParams extends PageDomain {
  /** 险别名称 */
  typeName?: string;
  /** 状态 0停用 1启用 */
  status?: string;
}

/** 险种管理配置信息 */
export interface JonlinkInsuranceType extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 险别名称 */
  typeName?: string;
  /** 险别编码 */
  typeCode?: string;
  /** 显示顺序 */
  sort?: number;
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
