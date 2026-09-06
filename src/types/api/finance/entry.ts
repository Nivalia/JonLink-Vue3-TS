import type { PageDomain, BaseEntity } from "../common";

/** 凭证分录配置分页查询参数 */
export interface EntryQuejlParams extends PageDomain {
  /** 凭证ID */
  voucherId?: number;
  /** 科目ID */
  subjectId?: number;
  /** 摘要 */
  summary?: string;
  /** 借方金额 */
  debitAmount?: string;
  /** 贷方金额 */
  creditAmount?: string;
  /** 往来单位ID（辅助核算，可空） */
  partnerId?: number;
  /** 银行账户ID（辅助核算，可空） */
  bankAccountId?: number;
  /** 排序 */
  sortOrder?: number;
}

/** 凭证分录配置信息 */
export interface FinVoucherEntry extends BaseEntity {
  /** 分录ID */
  id?: number;
  /** 凭证ID */
  voucherId?: number;
  /** 科目ID */
  subjectId?: number;
  /** 摘要 */
  summary?: string;
  /** 借方金额 */
  debitAmount?: string;
  /** 贷方金额 */
  creditAmount?: string;
  /** 往来单位ID（辅助核算，可空） */
  partnerId?: number;
  /** 银行账户ID（辅助核算，可空） */
  bankAccountId?: number;
  /** 排序 */
  sortOrder?: number;
}
