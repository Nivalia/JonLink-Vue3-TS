import type { PageDomain, BaseEntity } from "../common";

/** 佣金积分配置分页查询参数 */
export interface CommissionQuejlParams extends PageDomain {
  /** 订单号(核销关联,唯一幂等) */
  orderNo?: string;
  /** 创建时间 */
  createTime?: string;
}

/** 佣金积分配置信息 */
export interface WxDistCommission extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 订单号(核销关联,唯一幂等) */
  orderNo?: string;
  /** 下单客户手机号 */
  customerPhone?: string;
  /** 下单客户openid */
  customerOpenid?: string;
  /** 受益分销员(直接上级)user_id */
  beneficiaryId?: number;
  /** 受益分销员姓名 */
  beneficiaryName?: string;
  /** 该单佣金(核销金额) */
  commissionAmt?: string;
  /** 分润比例(默认100%=直接上级独享) */
  ratio?: string;
  /** 记入积分(=佣金*比例) */
  points?: string;
  /** 0待入账 1已入账 */
  status?: string;
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
