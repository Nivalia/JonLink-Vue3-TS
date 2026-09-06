import type { PageDomain, BaseEntity } from "../common";

/** 上游渠道商分页查询参数 */
export interface ChannelQuejlParams extends PageDomain {
  /** 渠道商名称 */
  channelName?: string;
  /** 联系人 */
  contactPerson?: string;
  /** 状态 0停用 1启用 */
  status?: string;
}

/** 上游渠道商信息 */
export interface JonlinkChannel extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 渠道商名称 */
  channelName?: string;
  /** 联系人ID(jonlink_contact_person.id) */
  contactId?: number;
  /** 联系人 */
  contactPerson?: string;
  /** 联系电话 */
  phone?: string;
  /** 微信号 */
  wechat?: string;
  /** 结算周期 */
  settleCycle?: string;
  /** 状态 0停用 1启用 */
  status?: string;
  /** 备注 */
  remark?: string;
}
