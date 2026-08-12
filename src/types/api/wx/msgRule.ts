import type { PageDomain, BaseEntity } from "../common";

/** 推送规则配置分页查询参数 */
export interface MsgRuleQuejlParams extends PageDomain {
  /** 规则编码（唯一，如 SETTLE_UP / SETTLE_DOWN） */
  ruleCode?: string;
  /** 业务事件类型（settle_up上游结算/settle_down下游结算/dist_commission分销佣金/order_verify订单核销） */
  bizType?: string;
  /** 是否启用（0停用 1启用） */
  enabled?: string;
}

/** 推送规则配置信息 */
export interface WxMsgRule extends BaseEntity {
  /** 规则ID */
  id?: number;
  /** 规则编码（唯一，如 SETTLE_UP / SETTLE_DOWN） */
  ruleCode?: string;
  /** 规则名称（如：上游结算通知） */
  ruleName?: string;
  /** 业务事件类型（settle_up上游结算/settle_down下游结算/dist_commission分销佣金/order_verify订单核销） */
  bizType?: string;
  /** 关联 wx_mp_template.id（微信后台模板） */
  templateId?: number;
  /** 内容组装规则(JSON)：keyword占位符映射，如 {"policyNo":"{保单号}","amount":"{金额}"} */
  contentRule?: string;
  /** 跳转地址模板(含{ticket}防伪占位)，可为空 */
  urlRule?: string;
  /** 受众规则(JSON)：如 {"source":"channel_phone"} 取台账渠道手机号；支持 fans_openid 直接推 */
  audienceRule?: string;
  /** 是否启用（0停用 1启用） */
  enabled?: string;
  /** 排序 */
  sortOrder?: number;
  /** 创建者 */
  createBy?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新者 */
  updateBy?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 备注 */
  remark?: string;
}
