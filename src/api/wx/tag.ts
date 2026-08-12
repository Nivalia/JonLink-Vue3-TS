import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'

// 查询标签列表
export function listTag(query: any): Promise<TableDataInfo<any[]>> {
  return request({
    url: '/wx/tag/list',
    method: 'get',
    params: query
  })
}

// 查询标签详细
export function getTag(id: number): Promise<AjaxResult<any>> {
  return request({
    url: '/wx/tag/' + id,
    method: 'get'
  })
}

// 新增标签
export function addTag(data: any): Promise<AjaxResult> {
  return request({
    url: '/wx/tag',
    method: 'post',
    data: data
  })
}

// 修改标签
export function updateTag(data: any): Promise<AjaxResult> {
  return request({
    url: '/wx/tag',
    method: 'put',
    data: data
  })
}

// 删除标签
export function delTag(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/wx/tag/' + id,
    method: 'delete'
  })
}
