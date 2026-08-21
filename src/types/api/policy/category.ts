import type { PageDomain, BaseEntity } from '../common'

/** 政策分类查询参数 */
export interface PolicyCategoryQuejlParams extends PageDomain {
  /** 分类名称 */
  categoryName?: string
  /** 父分类ID */
  parentId?: number
  /** 状态 0停用 1启用 */
  status?: string
}

/** 政策分类实体 */
export interface PolicyCategory extends BaseEntity {
  id?: number
  parentId?: number
  categoryName?: string
  sort?: number
  status?: string
  remark?: string
  /** 子分类(树查询时携带) */
  children?: PolicyCategory[]
}
