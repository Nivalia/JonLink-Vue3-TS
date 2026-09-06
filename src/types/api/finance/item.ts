import type { PageDomain, BaseEntity } from "../common";

/** 报销明细配置分页查询参数 */
export interface ItemQuejlParams extends PageDomain {
  /** 报销单ID */
  expenseId?: number;
  /** 费用项目 */
  itemName?: string;
  /** 金额 */
  amount?: string;
  /** 关联发票ID */
  invoiceId?: number;
  /** 排序 */
  sortOrder?: number;
}

/** 报销明细配置信息 */
export interface FinExpenseItem extends BaseEntity {
  /** 明细ID */
  id?: number;
  /** 报销单ID */
  expenseId?: number;
  /** 费用项目 */
  itemName?: string;
  /** 金额 */
  amount?: string;
  /** 关联发票ID */
  invoiceId?: number;
  /** 备注 */
  remark?: string;
  /** 排序 */
  sortOrder?: number;
}
