import type { AjaxResult, TableDataInfo, PolicyArticleQuejlParams, PolicyArticle, PolicyArticleVersion } from '@/types'
import request from '@/utils/request'

// 后台分页
export function listPolicyArticle(query: PolicyArticleQuejlParams): Promise<TableDataInfo<PolicyArticle[]>> {
  return request({ url: '/policy/article/list', method: 'get', params: query })
}

export function getPolicyArticle(id: number): Promise<AjaxResult<PolicyArticle>> {
  return request({ url: '/policy/article/' + id, method: 'get' })
}

export function addPolicyArticle(data: PolicyArticle): Promise<AjaxResult> {
  return request({ url: '/policy/article', method: 'post', data })
}

export function updatePolicyArticle(data: PolicyArticle): Promise<AjaxResult> {
  return request({ url: '/policy/article', method: 'put', data })
}

export function delPolicyArticle(ids: number[] | number): Promise<AjaxResult> {
  return request({ url: '/policy/article/' + ids, method: 'delete' })
}

export function changePolicyArticleStatus(id: number, status: string): Promise<AjaxResult> {
  return request({ url: '/policy/article/' + id + '/status', method: 'put', data: { status } })
}

// 历史版本
export function listVersions(articleId: number): Promise<AjaxResult<PolicyArticleVersion[]>> {
  return request({ url: '/policy/article/' + articleId + '/versions', method: 'get' })
}

export function restoreVersion(versionId: number): Promise<AjaxResult> {
  return request({ url: '/policy/article/version/' + versionId + '/restore', method: 'put' })
}

// 展示端
export function getCurrentByCategory(categoryId: number): Promise<AjaxResult<PolicyArticle>> {
  return request({ url: '/policy/view/current/' + categoryId, method: 'get' })
}

export function getHistory(articleId: number): Promise<AjaxResult<PolicyArticleVersion[]>> {
  return request({ url: '/policy/view/history/' + articleId, method: 'get' })
}

export function getHistoryDetail(versionId: number): Promise<AjaxResult<PolicyArticleVersion>> {
  return request({ url: '/policy/view/historyDetail/' + versionId, method: 'get' })
}

export function compareVersions(articleId: number, base: number, target: number): Promise<AjaxResult<{ current: PolicyArticle, base: PolicyArticleVersion, target: PolicyArticleVersion }>> {
  return request({ url: '/policy/view/compare', method: 'get', params: { articleId, base, target } })
}
