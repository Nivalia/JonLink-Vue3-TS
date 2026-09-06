import type { PageDomain, BaseEntity } from "../common";

/** 发送批次配置分页查询参数 */
export interface BatchQuejlParams extends PageDomain {
}

/** 发送批次配置信息 */
export interface WxMpSendBatch extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 批次号(唯一) */
  batchNo?: string;
  /** 使用的模板ID */
  templateId?: string;
  /** 总条数 */
  total?: number;
  /** 待发/超限待发 */
  pending?: number;
  /** 成功(送达) */
  success?: number;
  /** 失败 */
  fail?: number;
  /** 逾期放弃 */
  overdue?: number;
  /** 0处理中 1已完成 */
  status?: string;
  /** 核对通过数 */
  checkPassed?: number;
  /** 核对失败数 */
  checkFailed?: number;
  /** 核对时间 */
  checkTime?: string;
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
