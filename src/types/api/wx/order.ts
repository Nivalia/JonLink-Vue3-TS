import type { PageDomain, BaseEntity } from "../common";

/** 核销管理配置分页查询参数 */
export interface OrderQuejlParams extends PageDomain {
  /** 手机号(与粉丝表关联,索引) */
  phone?: string;
  /** 结算状态 0未结算 1已结算 */
  status?: string;
  /** 数据来源 0手工 1Excel导入 2台账同步 */
  sourceType?: string;
}

/** 核销管理配置信息 */
export interface WxBizOrder extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 订单号(唯一) */
  orderNo?: string;
  /** 手机号(与粉丝表关联,索引) */
  phone?: string;
  /** 客户名称 */
  customerName?: string;
  /** 服务/项目类型 */
  serviceType?: string;
  /** 车牌号(核销要素) */
  carNo?: string;
  /** 佣金/金额(核销要素) */
  amount?: string;
  /** 类型(字典) */
  orderType?: string;
  sourceType?: string;
  /** 结算状态 0未结算 1已结算 */
  status?: string;
  /** 核销状态(模板推送校验) 0未核销 1已核销 */
  verifyStatus?: string;
  /** 核销时间 */
  verifyTime?: string;
  /** 核销结果(成功/失败原因) */
  verifyMsg?: string;
  /** 自定义扩展字段(JSON键值) */
  extJson?: string;
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
