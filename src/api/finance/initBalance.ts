import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'

export function listInitBalance(query: any): Promise<TableDataInfo<any[]>> {
  return request({ url: '/finance/initBalance/list', method: 'get', params: query })
}

export function saveInitBalance(data: any[]): Promise<AjaxResult<number>> {
  return request({ url: '/finance/initBalance', method: 'post', data })
}

export function importInitBalance(file: File): Promise<AjaxResult<number>> {
  const formData = new FormData()
  formData.append('file', file)
  return request({ url: '/finance/initBalance/import', method: 'post', data: formData, headers: { 'Content-Type': 'multipart/form-data' } })
}

export function auditInitBalance(periodCode: string): Promise<AjaxResult> {
  return request({ url: '/finance/initBalance/audit/' + periodCode, method: 'post' })
}

export function cancelAuditInitBalance(periodCode: string): Promise<AjaxResult> {
  return request({ url: '/finance/initBalance/cancel-audit/' + periodCode, method: 'post' })
}

export function getInitBalanceSummary(periodCode: string): Promise<AjaxResult<any>> {
  return request({ url: '/finance/initBalance/summary/' + periodCode, method: 'get' })
}