import type { PageDomain, BaseEntity } from "../common";

/** 台账记账日志配置分页查询参数 */
export interface LogQuejlParams extends PageDomain {
  /** 台账行ID */
  ledgerId?: number;
  /** 保单号（冗余） */
  ledgerPolicyNo?: string;
  /** 台账保费（冗余快照） */
  ledgerAmount?: string;
  /** 生成凭证ID */
  voucherId?: number;
  /** 凭证号 */
  voucherNo?: string;
  /** 0台账记账 1上游结算记账 2下游结算记账 */
  bookType?: string;
  /** 结算记录ID（book_type=1/2 时） */
  settleRecordId?: number;
  /** 记账人 */
  bookUser?: string;
  /** 记账时间 */
  bookTime?: string;
  /** 1有效 0已反记账 */
  status?: string;
}

/** 台账记账日志配置信息 */
export interface FinLedgerVoucherLog extends BaseEntity {
  /** 日志ID */
  id?: number;
  /** 台账行ID */
  ledgerId?: number;
  /** 保单号（冗余） */
  ledgerPolicyNo?: string;
  /** 台账保费（冗余快照） */
  ledgerAmount?: string;
  /** 生成凭证ID */
  voucherId?: number;
  /** 凭证号 */
  voucherNo?: string;
  /** 0台账记账 1上游结算记账 2下游结算记账 */
  bookType?: string;
  /** 结算记录ID（book_type=1/2 时） */
  settleRecordId?: number;
  /** 记账人 */
  bookUser?: string;
  /** 记账时间 */
  bookTime?: string;
  /** 1有效 0已反记账 */
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
