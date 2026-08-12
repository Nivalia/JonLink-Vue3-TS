import type { PageDomain, BaseEntity } from "../common";

/** 电子台账流水配置分页查询参数 */
export interface WxLedgerItemQuejlParams extends PageDomain {
  /** 类型 1核销 2分销积分 3模板推送 4扫码 5粉丝绑定 6手动调整 */
  ledgerType?: string;
  /** 客户手机号 */
  phone?: string;
}

/** 电子台账流水配置信息 */
export interface WxLedgerItem extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 台账流水号(唯一) */
  ledgerNo?: string;
  /** 类型 1核销 2分销积分 3模板推送 4扫码 5粉丝绑定 6手动调整 */
  ledgerType?: string;
  /** 关联业务单号(订单号/佣金单/批次号/scene) */
  bizNo?: string;
  /** 客户手机号 */
  phone?: string;
  /** 客户openid */
  openid?: string;
  /** 流水金额(佣金等) */
  amount?: string;
  /** 流水分值(积分入账=amount) */
  points?: string;
  /** 方向 0流出 1流入 2中性(核销/推送) */
  direction?: string;
  /** 经办人(手动调整时; 自动=SYSTEM) */
  bizUser?: string;
  /** 0作废 1有效 */
  status?: string;
  /** 业务发生时间(核销/发送/扫码时刻) */
  occurredTime?: string;
  /** 创建者 */
  createBy?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新者 */
  updateBy?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 备注(失败原因等) */
  remark?: string;
}
