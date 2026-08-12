import type { PageDomain, BaseEntity } from "../common";

/** 二维码管理配置分页查询参数 */
export interface QrQuejlParams extends PageDomain {
  /** 0分销(永久) 1活动 2通知 3公告 */
  bizType?: string;
  /** 过期时间(临时码30天内) */
  expireTime?: string;
}

/** 二维码管理配置信息 */
export interface WxQrScene extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 微信永久二维码scene值(唯一) */
  sceneId?: number;
  /** 分销员(系统用户ID) */
  userId?: number;
  /** 分销员姓名(冗余) */
  userName?: string;
  /** 0永久 1临时 */
  qrType?: string;
  /** 微信API返回ticket */
  ticket?: string;
  /** 二维码图片地址(本地保存) */
  qrUrl?: string;
  /** 0停用 1启用 */
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
  /** 0分销(永久) 1活动 2通知 3公告 */
  bizType?: string;
  /** 临时码场景字符串(act_1001等) */
  sceneStr?: string;
  /** 过期时间(临时码30天内) */
  expireTime?: string;
  /** 落地页地址(活动/公告详情) */
  landingUrl?: string;
}
