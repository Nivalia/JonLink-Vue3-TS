import type { PageDomain, BaseEntity } from "../common";

/** 会计期间配置分页查询参数 */
export interface PeriodQuejlParams extends PageDomain {
  /** 期间编码（如 202608） */
  periodCode?: string;
  /** 期间名称（如 2026年8月） */
  periodName?: string;
  /** 开始日期 */
  startDate?: string;
  /** 结束日期 */
  endDate?: string;
  /** 0未结账 1已结账 */
  status?: string;
  /** 结账人 */
  closeUser?: string;
  /** 结账时间 */
  closeTime?: string;
}

/** 会计期间配置信息 */
export interface FinPeriod extends BaseEntity {
  /** 期间ID */
  id?: number;
  /** 期间编码（如 202608） */
  periodCode?: string;
  /** 期间名称（如 2026年8月） */
  periodName?: string;
  /** 开始日期 */
  startDate?: string;
  /** 结束日期 */
  endDate?: string;
  /** 0未结账 1已结账 */
  status?: string;
  /** 结账人 */
  closeUser?: string;
  /** 结账时间 */
  closeTime?: string;
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
