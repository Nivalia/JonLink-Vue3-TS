import type { PageDomain, BaseEntity } from "../common";

/** 应收单配置分页查询参数 */
export interface ReceivableQuejlParams extends PageDomain {
  /** 单据号（RE+日期+流水） */
  docNo?: string;
  /** 往来单位ID */
  partnerId?: number;
  /** 业务类型（ledger_premium/ledger_up_commission/manual 等） */
  bizType?: string;
  /** 来源类型 */
  sourceType?: string;
  /** 来源业务ID */
  sourceId?: number;
  /** 单据金额 */
  amount?: string;
  /** 已核销金额 */
  paidAmount?: string;
  /** 未核销余额（=amount-paid_amount） */
  remainAmount?: string;
  /** 到期日 */
  dueDate?: string;
  /** 0未结清 1已结清 */
  status?: string;
  /** 记账凭证ID（来源凭证） */
  voucherId?: number;
}

/** 应收单配置信息 */
export interface FinReceivable extends BaseEntity {
  /** 应收单ID */
  id?: number;
  /** 单据号（RE+日期+流水） */
  docNo?: string;
  /** 往来单位ID */
  partnerId?: number;
  /** 业务类型（ledger_premium/ledger_up_commission/manual 等） */
  bizType?: string;
  /** 来源类型 */
  sourceType?: string;
  /** 来源业务ID */
  sourceId?: number;
  /** 单据金额 */
  amount?: string;
  /** 已核销金额 */
  paidAmount?: string;
  /** 未核销余额（=amount-paid_amount） */
  remainAmount?: string;
  /** 到期日 */
  dueDate?: string;
  /** 0未结清 1已结清 */
  status?: string;
  /** 记账凭证ID（来源凭证） */
  voucherId?: number;
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
