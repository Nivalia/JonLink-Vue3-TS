import type { PageDomain, BaseEntity } from "../common";

/** 凭证模板配置分页查询参数 */
export interface TemplateQuejlParams extends PageDomain {
  /** 模板编码（ledger_book / settle_up / settle_down / receipt / payment / expense / period_close_income / period_close_cost 等） */
  templateCode?: string;
  /** 模板名称 */
  templateName?: string;
  /** 凭证摘要模板 */
  voucherSummary?: string;
  /** 分录结构JSON（[{subject_code, summary, debit/credit, calc_formula}]） */
  entriesJson?: string;
  /** 0停用 1启用 */
  status?: string;
}

/** 凭证模板配置信息 */
export interface FinVoucherTemplate extends BaseEntity {
  /** 模板ID */
  id?: number;
  /** 模板编码（ledger_book / settle_up / settle_down / receipt / payment / expense / period_close_income / period_close_cost 等） */
  templateCode?: string;
  /** 模板名称 */
  templateName?: string;
  /** 凭证摘要模板 */
  voucherSummary?: string;
  /** 分录结构JSON（[{subject_code, summary, debit/credit, calc_formula}]） */
  entriesJson?: string;
  /** 备注 */
  remark?: string;
  /** 0停用 1启用 */
  status?: string;
  /** 创建者 */
  createBy?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新者 */
  updateBy?: string;
  /** 更新时间 */
  updateTime?: string;
}
