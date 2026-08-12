import type { PageDomain, BaseEntity } from "../common";

/** 结算记录配置分页查询参数 */
export interface SettleRecordQuejlParams extends PageDomain {
  /** 方向 0上游结费(收入) 1下游结费(支出) */
  direction?: string;
  /** 关联台账行(单笔结算) */
  ledgerId?: number;
  /** 结算时间 */
  settleDate?: string;
}

/** 结算记录配置信息 */
export interface JonlinkSettleRecord extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 结算单号(唯一) */
  settleNo?: string;
  /** 方向 0上游结费(收入) 1下游结费(支出) */
  direction?: string;
  /** 关联台账行(单笔结算) */
  ledgerId?: number;
  /** 保单号(冗余) */
  policyNo?: string;
  /** 结算金额(如上游=上游税后佣金, 下游=下游佣金) */
  amount?: string;
  /** 状态 0作废 1已结算 */
  settleStatus?: string;
  /** 经手人 */
  opUser?: string;
  /** 结算时间 */
  settleDate?: string;
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
