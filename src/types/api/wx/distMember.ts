import type { PageDomain, BaseEntity } from "../common";

/** 分销员档案配置分页查询参数 */
export interface DistMemberQuejlParams extends PageDomain {
  /** 系统用户ID(唯一) */
  userId?: number;
  /** 链深度(顶级=1,展示用) */
  depth?: number;
}

/** 分销员档案配置信息 */
export interface WxDistMember extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 系统用户ID(唯一) */
  userId?: number;
  /** 姓名(冗余) */
  userName?: string;
  /** 上级分销员user_id(空=顶级) */
  parentId?: number;
  /** 链深度(顶级=1,展示用) */
  depth?: number;
  /** 积分累计(佣金1:1) */
  accumPoints?: string;
  /** 0停用 1启用 */
  status?: string;
  /** 成为分销员时间 */
  joinTime?: string;
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
