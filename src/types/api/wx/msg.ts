import type { PageDomain, BaseEntity } from "../common";

/** 发送记录配置分页查询参数 */
export interface MsgQuejlParams extends PageDomain {
  /** 批次号(手工/导入) */
  batchNo?: string;
  /** 手机号(冗余冗余,便于查询) */
  phone?: string;
  /** 0待发 1成功 2失败 3超限待发(次日补) 4逾期放弃 5未找到粉丝 */
  status?: string;
  /** 创建时间 */
  createTime?: string;
}

/** 发送记录配置信息 */
export interface WxMpTemplateMsg extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 批次号(手工/导入) */
  batchNo?: string;
  /** 业务流水号(幂等,去重) */
  transposeNo?: string;
  /** 接收openid */
  openid?: string;
  /** 手机号(冗余冗余,便于查询) */
  phone?: string;
  /** 模板ID */
  templateId?: string;
  /** 点击跳转链接 */
  url?: string;
  /** 关键词值 JSON(按模板keyword_order顺序) */
  keywords?: string;
  /** 微信返回的msgid */
  msgId?: string;
  /** 0待发 1成功 2失败 3超限待发(次日补) 4逾期放弃 5未找到粉丝 */
  status?: string;
  /** 错误信息(失败原因) */
  errMsg?: string;
  /** 0业务触发 1手工/导入 2合并汇总 */
  source?: string;
  /** 业务类型(ORDER_NOTIFY等) */
  bizType?: string;
  /** 业务单号 */
  bizId?: string;
  /** 批次内行号(定位失败行) */
  rowNo?: number;
  /** 合并组ID(多条合并为1条时的关联) */
  groupId?: number;
  /** 实际发送时间 */
  sendTime?: string;
  /** 创建者 */
  createBy?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新者 */
  updateBy?: string;
  /** 更新时间 */
  updateTime?: string;
}
