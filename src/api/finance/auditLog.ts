import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'

export function listAuditLog(query: any): Promise<TableDataInfo<any[]>> {
  return request({ url: '/system/auditLog/list', method: 'get', params: query })
}

export function getAuditLogDetail(id: number): Promise<AjaxResult<any>> {
  return request({ url: '/system/auditLog/' + id, method: 'get' })
}

export function exportAuditLog(query: any): Promise<AjaxResult<string>> {
  return request({ url: '/system/auditLog/export', method: 'get', params: query })
}

export function getAuditLogByModule(module: string, targetId: number): Promise<AjaxResult<any[]>> {
  return request({ url: '/system/auditLog/module/' + module + '/' + targetId, method: 'get' })
}

export function clearAuditLog(beforeDate: string): Promise<AjaxResult<number>> {
  return request({ url: '/system/auditLog/clear', method: 'delete', data: { beforeDate } })
}