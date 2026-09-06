import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'

export function listRevenue(query: any): Promise<AjaxResult<any>> {
  return request({ url: '/finance/revenue/summary', method: 'get', params: query })
}

export function confirmRevenue(data: any): Promise<AjaxResult<number>> {
  return request({ url: '/finance/revenue/confirm', method: 'post', data })
}

export function cancelRevenue(id: number): Promise<AjaxResult> {
  return request({ url: '/finance/revenue/cancel/' + id, method: 'post' })
}

export function reverseRevenue(id: number): Promise<AjaxResult> {
  return request({ url: '/finance/revenue/reverse/' + id, method: 'post' })
}

export function getRevenueDetail(id: number): Promise<AjaxResult<any>> {
  return request({ url: '/finance/revenue/' + id, method: 'get' })
}

export function updateRevenue(data: any): Promise<AjaxResult> {
  return request({ url: '/finance/revenue', method: 'put', data })
}

export function deleteRevenue(id: number): Promise<AjaxResult> {
  return request({ url: '/finance/revenue/' + id, method: 'delete' })
}