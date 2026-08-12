import type { PageDomain, BaseEntity } from "../common";

/** 扫码日志配置分页查询参数 */
export interface QrScanLogQuejlParams extends PageDomain {
  /** 0分销 1活动 2通知 3公告 */
  bizType?: string;
  /** 扫码粉丝openid */
  openid?: string;
  /** 扫码时间 */
  scanTime?: string;
}

/** 扫码日志配置信息 */
export interface WxQrScanLog extends BaseEntity {
  /** 主键 */
  id?: number;
  /** scene值 */
  sceneId?: number;
  /** 0分销 1活动 2通知 3公告 */
  bizType?: string;
  /** 场景串(临时码) */
  sceneStr?: string;
  /** 扫码粉丝openid */
  openid?: string;
  /** 是否本次扫码新关注 0否 1是 */
  isNewFollow?: string;
  /** 扫码时间 */
  scanTime?: string;
  /** 备注 */
  remark?: string;
}
