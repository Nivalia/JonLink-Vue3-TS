import type { PageDomain, BaseEntity } from "../common";

/** 往来单位配置分页查询参数 */
export interface PartnerQuejlParams extends PageDomain {
  /** 1上游渠道商 2下游业务员 3客户 4其他 */
  partnerType?: string;
  /** 往来单位名称（唯一） */
  partnerName?: string;
  /** 关联表（jonlink_channel / jonlink_channel_user） */
  refTable?: string;
  /** 关联表记录ID */
  refId?: number;
  /** 电话 */
  phone?: string;
  /** 联系人 */
  contact?: string;
  /** 0停用 1启用 */
  status?: string;
}

/** 往来单位配置信息 */
export interface FinPartner extends BaseEntity {
  /** 往来单位ID */
  id?: number;
  /** 1上游渠道商 2下游业务员 3客户 4其他 */
  partnerType?: string;
  /** 往来单位名称（唯一） */
  partnerName?: string;
  /** 关联表（jonlink_channel / jonlink_channel_user） */
  refTable?: string;
  /** 关联表记录ID */
  refId?: number;
  /** 电话 */
  phone?: string;
  /** 联系人 */
  contact?: string;
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
