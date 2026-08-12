import type { PageDomain, BaseEntity } from "../common";

/** 台账日汇总配置分页查询参数 */
export interface WxLedgerSummaryQuejlParams extends PageDomain {
  /** 台账类型 */
  ledgerType?: string;
}

/** 台账日汇总配置信息 */
export interface WxLedgerSummary extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 统计日期 */
  statDate?: string;
  /** 台账类型 */
  ledgerType?: string;
  /** 当日笔数 */
  totalCount?: number;
  /** 当日金额合计 */
  totalAmount?: string;
  /** 当日积分合计 */
  totalPoints?: string;
}
