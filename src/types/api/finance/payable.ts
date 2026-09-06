import type { PageDomain, BaseEntity } from "../common";

/** 应付单配置分页查询参数 */
export interface PayableQuejlParams extends PageDomain {
  /** 单据号（PA+日期+流水） */
  docNo?: string;
  /** 往来单位ID */
  partnerId?: number;
  /** 业务类型（ledger_down_commission/manual 等） */
  bizType?: string;
  /** 来源类型 */
  sourceType?: string;
  /** 来源业务ID */
  sourceId?: number;
  /** 单据金额 */
  amount?: string;
  /** 已核销金额 */
  paidAmount?: string;
  /** 未核销余额 */
  remainAmount?: string;
  /** 到期日 */
  dueDate?: string;
  /** 0未结清 1已结清 */
  status?: string;
  /** 记账凭证ID */
  voucherId?: number;
}

/** 应付单配置信息 */
export interface FinPayable extends BaseEntity {
  /** 应付单ID */
  id?: number;
  /** 单据号（PA+日期+流水） */
  docNo?: string;
  /** 往来单位ID */
  partnerId?: number;
  /** 业务类型（ledger_down_commission/manual 等） */
  bizType?: string;
  /** 来源类型 */
  sourceType?: string;
  /** 来源业务ID */
  sourceId?: number;
  /** 单据金额 */
  amount?: string;
  /** 已核销金额 */
  paidAmount?: string;
  /** 未核销余额 */
  remainAmount?: string;
  /** 到期日 */
  dueDate?: string;
  /** 0未结清 1已结清 */
  status?: string;
  /** 记账凭证ID */
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
