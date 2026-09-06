import type { PageDomain, BaseEntity } from "../common";

/** 记账凭证配置分页查询参数 */
export interface VoucherQuejlParams extends PageDomain {
  /** 凭证号（记-yyyyMM-NNNN） */
  voucherNo?: string;
  /** 期间编码 */
  periodCode?: string;
  /** 凭证日期 */
  voucherDate?: string;
  /** 来源类型（manual/ledger/settle_up/settle_down/receipt/payment/expense/period_close） */
  sourceType?: string;
  /** 来源业务ID（台账行/结算记录等） */
  sourceId?: number;
  /** 摘要 */
  summary?: string;
  /** 借方合计 */
  totalDebit?: string;
  /** 贷方合计 */
  totalCredit?: string;
  /** 0草稿 1已审核 2已过账 3已作废 */
  status?: string;
  /** 审核人 */
  auditor?: string;
  /** 审核时间 */
  auditTime?: string;
  /** 过账人 */
  poster?: string;
  /** 过账时间 */
  postTime?: string;
  /** 制单人 */
  voucherMaker?: string;
}

/** 记账凭证配置信息 */
export interface FinVoucher extends BaseEntity {
  /** 凭证ID */
  id?: number;
  /** 凭证号（记-yyyyMM-NNNN） */
  voucherNo?: string;
  /** 期间编码 */
  periodCode?: string;
  /** 凭证日期 */
  voucherDate?: string;
  /** 来源类型（manual/ledger/settle_up/settle_down/receipt/payment/expense/period_close） */
  sourceType?: string;
  /** 来源业务ID（台账行/结算记录等） */
  sourceId?: number;
  /** 摘要 */
  summary?: string;
  /** 借方合计 */
  totalDebit?: string;
  /** 贷方合计 */
  totalCredit?: string;
  /** 0草稿 1已审核 2已过账 3已作废 */
  status?: string;
  /** 审核人 */
  auditor?: string;
  /** 审核时间 */
  auditTime?: string;
  /** 过账人 */
  poster?: string;
  /** 过账时间 */
  postTime?: string;
  /** 制单人 */
  voucherMaker?: string;
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
  /** 分录列表(录入/详情使用) */
  entries?: FinVoucherEntry[];
}

/** 凭证分录 */
export interface FinVoucherEntry {
  id?: number;
  voucherId?: number;
  /** 科目ID */
  subjectId?: number;
  /** 科目编码(用于显示) */
  subjectCode?: string;
  /** 科目名称(用于显示) */
  subjectName?: string;
  /** 摘要 */
  summary?: string;
  /** 借方金额 */
  debitAmount?: number;
  /** 贷方金额 */
  creditAmount?: number;
  partnerId?: number;
  bankAccountId?: number;
  sortOrder?: number;
}
