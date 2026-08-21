import type { PageDomain, BaseEntity } from '../common'

/** 政策文章查询参数 */
export interface PolicyArticleQuejlParams extends PageDomain {
  categoryId?: number
  title?: string
  status?: string
}

/** 政策文章实体 */
export interface PolicyArticle extends BaseEntity {
  id?: number
  categoryId?: number
  categoryName?: string
  title?: string
  /** 图片 JSON 数组字符串(后端约定为 JSON.stringify([url,...])) */
  pics?: string
  status?: string
  versionNo?: number
  viewCount?: number
  remark?: string
}

/** 政策历史版本实体 */
export interface PolicyArticleVersion extends BaseEntity {
  id?: number
  articleId?: number
  versionNo?: number
  title?: string
  pics?: string
  createBy?: string
  createTime?: string
}
