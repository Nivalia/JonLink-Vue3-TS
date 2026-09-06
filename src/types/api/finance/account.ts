import type { PageDomain, BaseEntity } from "../common";

/** 银行账户配置分页查询参数 */
export interface AccountQuejlParams extends PageDomain {
  /** 账户名称 */
  accountName?: string;
  /** 账号（唯一） */
  accountNo?: string;
  /** 开户行 */
  bankName?: string;
  /** 期初余额 */
  initBalance?: string;
  /** 当前余额（实时累计） */
  currentBalance?: string;
  /** 0停用 1启用 */
  status?: string;
}

/** 银行账户配置信息 */
export interface FinBankAccount extends BaseEntity {
  /** 账户ID */
  id?: number;
  /** 账户名称 */
  accountName?: string;
  /** 账号（唯一） */
  accountNo?: string;
  /** 开户行 */
  bankName?: string;
  /** 期初余额 */
  initBalance?: string;
  /** 当前余额（实时累计） */
  currentBalance?: string;
  /** 0停用 1启用 */
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
