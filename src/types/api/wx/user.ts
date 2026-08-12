import type { PageDomain, BaseEntity } from "../common";

/** 粉丝管理配置分页查询参数 */
export interface UserQuejlParams extends PageDomain {
  /** 手机号(授权回填/手动更换) */
  phone?: string;
  /** 昵称 */
  nickname?: string;
  /** 关注时间(重复关注刷新) */
  subscribeTime?: string;
}

/** 粉丝管理配置信息 */
export interface WxMpUser extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 微信openid(无感获取) */
  openid?: string;
  /** 手机号(授权回填/手动更换) */
  phone?: string;
  /** 昵称 */
  nickname?: string;
  /** 头像地址 */
  avatar?: string;
  /** 性别 0未知 1男 2女 */
  sex?: string;
  /** 国家 */
  country?: string;
  /** 省 */
  province?: string;
  /** 市 */
  city?: string;
  /** 关注状态 0否 1是 */
  subscribe?: string;
  /** 关注时间(重复关注刷新) */
  subscribeTime?: string;
  /** 取关时间 */
  unsubscribeTime?: string;
  /** 最近活跃时间 */
  lastActivityTime?: string;
  /** 互动次数 */
  activityCount?: number;
  /** 活跃度 1高 2中 3低(定时任务计算) */
  activityLevel?: string;
  /** 绑定系统用户ID(可空) */
  userId?: number;
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
  /** 上级分销员user_id(扫码绑定) */
  distributorId?: number;
  /** 归属绑定时间 */
  bindTime?: string;
  /** 0扫码 1手动 2其它 */
  bindSource?: string;
}
