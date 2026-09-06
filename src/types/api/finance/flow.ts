import type { PageDomain, BaseEntity } from "../common";

/** 资金流水配置分页查询参数 */
export interface FlowQuejlParams extends PageDomain {
  /** 银行账户ID */
  bankAccountId?: number;
  /** 0流入 1流出 */
  direction?: string;
  /** 金额 */
  amount?: string;
  /** 账户余额（实时累计） */
  balanceAfter?: string;
  /** 来源业务类型 */
  bizType?: string;
  /** 来源业务ID */
  bizId?: number;
  /** 流水时间 */
  flowTime?: string;
}

/** 资金流水配置信息 */
export interface FinCashFlow extends BaseEntity {
  /** 流水ID */
  id?: number;
  /** 银行账户ID */
  bankAccountId?: number;
  /** 0流入 1流出 */
  direction?: string;
  /** 金额 */
  amount?: string;
  /** 账户余额（实时累计） */
  balanceAfter?: string;
  /** 来源业务类型 */
  bizType?: string;
  /** 来源业务ID */
  bizId?: number;
  /** 流水时间 */
  flowTime?: string;
  /** 备注 */
  remark?: string;
  /** 创建者 */
  createBy?: string;
  /** 创建时间 */
  createTime?: string;
}
