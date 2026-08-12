import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'

// 查询回调日志列表
export function listWxLog(query: any): Promise<TableDataInfo<any[]>> {
  return request({
    url: '/wx/wxlog/list',
    method: 'get',
    params: query
  })
}

// 查询回调日志详细
export function getWxLog(id: number): Promise<AjaxResult<any>> {
  return request({
    url: '/wx/wxlog/' + id,
    method: 'get'
  })
}

// 删除回调日志
export function delWxLog(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/wx/wxlog/' + id,
    method: 'delete'
  })
}

// 清空回调日志
export function clearWxLog(): Promise<AjaxResult> {
  return request({
    url: '/wx/wxlog/clear',
    method: 'delete'
  })
}
