import type { PageDomain, BaseEntity } from "../common";

/** 付款单配置分页查询参数 */
export interface PaymentQuejlParams extends PageDomain {
  /** 单号（FK+日期+流水） */
  billNo?: string;
  /** 往来单位ID */
  partnerId?: number;
  /** 银行账户ID */
  bankAccountId?: number;
  /** 金额 */
  amount?: string;
  /** 业务类型（settle_down/expense/manual 等） */
  bizType?: string;
  /** 来源类型 */
  sourceType?: string;
  /** 来源业务ID */
  sourceId?: number;
  /** 单据日期 */
  billDate?: string;
  /** 0草稿 1已确认 */
  status?: string;
  /** 关联凭证 */
  voucherId?: number;
  /** 确认时间 */
  confirmTime?: string;
}

/** 付款单配置信息 */
export interface FinPayment extends BaseEntity {
  /** 付款单ID */
  id?: number;
  /** 单号（FK+日期+流水） */
  billNo?: string;
  /** 往来单位ID */
  partnerId?: number;
  /** 银行账户ID */
  bankAccountId?: number;
  /** 金额 */
  amount?: string;
  /** 业务类型（settle_down/expense/manual 等） */
  bizType?: string;
  /** 来源类型 */
  sourceType?: string;
  /** 来源业务ID */
  sourceId?: number;
  /** 单据日期 */
  billDate?: string;
  /** 0草稿 1已确认 */
  status?: string;
  /** 关联凭证 */
  voucherId?: number;
  /** 确认时间 */
  confirmTime?: string;
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
