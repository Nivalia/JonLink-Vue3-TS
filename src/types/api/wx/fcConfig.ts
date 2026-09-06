import type { PageDomain, BaseEntity } from "../common";

/** 字段配置分页查询参数 */
export interface FcConfigQuejlParams extends PageDomain {
}

/** 字段配置信息 */
export interface WxFcConfig extends BaseEntity {
  id?: number;
  fieldKey?: string;
  fieldLabel?: string;
  fieldType?: string;
  sourceType?: string;
  dataSource?: string;
  visible?: string;
  sortNo?: number;
  required?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}
