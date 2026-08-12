import type { PageDomain, BaseEntity } from "../common";

/** 账号配置配置分页查询参数 */
export interface AccountQuejlParams extends PageDomain {
}

/** 账号配置配置信息 */
export interface WxMpAccount extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 公众号 AppID */
  appId?: string;
  /** AppSecret(加密存储) */
  appSecret?: string;
  /** 公众号名称 */
  name?: string;
  /** 服务器配置Token(验签) */
  token?: string;
  /** 消息加密密钥(可空) */
  encodingAesKey?: string;
  /** 加密模式 0明文 1加密 */
  encryptMode?: string;
  /** 缓存的access_token */
  accessToken?: string;
  /** access_token过期时间 */
  tokenExpireTime?: string;
  /** 状态 0停用 1启用 */
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
