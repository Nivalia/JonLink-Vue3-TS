import type { PageDomain, BaseEntity } from "../common";

/** 保险台账配置分页查询参数 */
export interface LedgerQuejlParams extends PageDomain {
  /** 日期(自动=当日) */
  ledgerDate?: string;
  /** 渠道/业务员名称(带出) */
  channelName?: string;
  /** 保单号(手动,可重复) */
  policyNo?: string;
  /** 险别(产品带出) */
  insuranceType?: string;
  /** 上游结费 0未结算 1已结算 */
  upSettleStatus?: string;
}

/** 保险台账配置信息 */
export interface JonlinkInsuranceLedger extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 日期(自动=当日) */
  ledgerDate?: string;
  /** 渠道来源 0自定义 1公众号粉丝 2系统业务员 3企业微信(预留) */
  channelType?: string;
  /** 渠道关联ID(按type指向wx_mp_user.id/sys_user.user_id) */
  channelRef?: number;
  /** 渠道/业务员名称(带出) */
  channelName?: string;
  /** 保单号(手动,可重复) */
  policyNo?: string;
  /** 产品ID(选产品联动) */
  productId?: number;
  /** 产品名称(带出) */
  productName?: string;
  /** 险别(产品带出) */
  insuranceType?: string;
  /** 保险公司(产品带出) */
  insuranceCompany?: string;
  /** 投保人(手动) */
  applicant?: string;
  /** 被保人(手动) */
  insured?: string;
  /** 保费(手动,¥) */
  premium?: string;
  /** 是否含税 0否 1是(产品带出) */
  taxFlag?: string;
  /** 上游专属返利%(产品带出) */
  upRate?: string;
  /** 下游专属返利%(产品带出) */
  downRate?: string;
  /** 上游渠道(产品带出) */
  upChannel?: string;
  /** 下游佣金(自动算) */
  downCommission?: string;
  /** 上游税后佣金(自动算) */
  upCommission?: string;
  /** 净费=保费-下游佣金(自动算) */
  netFee?: string;
  /** 利润=上游税后佣金-下游佣金(自动算) */
  profit?: string;
  /** 上游结费 0未结算 1已结算 */
  upSettleStatus?: string;
  /** 下游结费 0未结算 1已结算 */
  downSettleStatus?: string;
  /** 上游结算单号 */
  upSettleNo?: string;
  /** 下游结算单号 */
  downSettleNo?: string;
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
