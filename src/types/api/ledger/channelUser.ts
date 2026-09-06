import type { PageDomain, BaseEntity } from "../common";

/** 渠道/业务员分页查询参数 */
export interface ChannelUserQuejlParams extends PageDomain {
  /** 姓名/名称 */
  userName?: string;
  /** 手机号 */
  phone?: string;
  /** 类型 1渠道业务员 2自定义业务员 */
  userType?: string;
  /** 状态 0停用 1启用 */
  status?: string;
}

/** 渠道/业务员信息 */
export interface JonlinkChannelUser extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 姓名/名称 */
  userName?: string;
  /** 手机号 */
  phone?: string;
  /** 类型 1渠道业务员 2自定义业务员 */
  userType?: string;
  /** 状态 0停用 1启用 */
  status?: string;
  /** 备注 */
  remark?: string;
}
