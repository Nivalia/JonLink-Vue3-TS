import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'

export function listTax(query: any): Promise<AjaxResult<any>> {
  return request({ url: '/finance/tax/summary/' + (query.periodCode || '202608'), method: 'get' })
}

export function calculateTax(periodCode: string): Promise<AjaxResult<number>> {
  return request({ url: '/finance/tax/calculate/' + periodCode, method: 'post' })
}

export function getTaxDetail(id: number): Promise<AjaxResult<any>> {
  return request({ url: '/finance/tax/' + id, method: 'get' })
}

export function submitTaxDeclaration(data: any): Promise<AjaxResult> {
  return request({ url: '/finance/tax/declare', method: 'post', data })
}

export function getTaxReport(periodCode: string, taxType: string): Promise<AjaxResult<any>> {
  return request({ url: '/finance/tax/report/' + periodCode + '/' + taxType, method: 'get' })
}

export function listTaxType(): Promise<AjaxResult<any[]>> {
  return request({ url: '/finance/tax/types', method: 'get' })
}