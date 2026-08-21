import type { AjaxResult, TableDataInfo, PolicyCategoryQuejlParams, PolicyCategory } from '@/types'
import request from '@/utils/request'

// 后台分页
export function listPolicyCategory(query: PolicyCategoryQuejlParams): Promise<TableDataInfo<PolicyCategory[]>> {
  return request({ url: '/policy/category/list', method: 'get', params: query })
}

// 树(展示端)
export function treePolicyCategory(query?: Partial<PolicyCategoryQuejlParams>): Promise<AjaxResult<PolicyCategory[]>> {
  return request({ url: '/policy/category/tree', method: 'get', params: query })
}

export function getPolicyCategory(id: number): Promise<AjaxResult<PolicyCategory>> {
  return request({ url: '/policy/category/' + id, method: 'get' })
}

export function addPolicyCategory(data: PolicyCategory): Promise<AjaxResult> {
  return request({ url: '/policy/category', method: 'post', data })
}

export function updatePolicyCategory(data: PolicyCategory): Promise<AjaxResult> {
  return request({ url: '/policy/category', method: 'put', data })
}

export function delPolicyCategory(ids: number[] | number): Promise<AjaxResult> {
  return request({ url: '/policy/category/' + ids, method: 'delete' })
}
