import type { PageDomain, BaseEntity } from "../common";

/** 模板管理配置分页查询参数 */
export interface TemplateQuejlParams extends PageDomain {
  /** 微信模板ID(唯一) */
  templateId?: string;
  /** 模板标题 */
  title?: string;
}

/** 模板管理配置信息 */
export interface WxMpTemplate extends BaseEntity {
  /** 主键 */
  id?: number;
  /** 微信模板ID(唯一) */
  templateId?: string;
  /** 模板库短ID(创建时用) */
  templateIdShort?: string;
  /** 模板标题 */
  title?: string;
  /** 模板内容(含{{keywordN.DATA}}占位) */
  content?: string;
  /** 关键词顺序(如 keyword1,keyword2..) */
  keywordOrder?: string;
  /** 主营行业 */
  primaryIndustry?: string;
  /** 副营行业 */
  deputyIndustry?: string;
  /** 模板示例 */
  example?: string;
  /** 状态 0停用 1启用(本地启停) */
  status?: string;
  /** 关键词元数据 JSON */
  keywordMeta?: string;
  /** 链接类型 0无 1关联H5 2自定义URL */
  urlType?: string;
  /** 关联H5页面ID */
  h5PageId?: number;
  /** 自定义URL(支持 {ticket}) */
  customUrl?: string;
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
