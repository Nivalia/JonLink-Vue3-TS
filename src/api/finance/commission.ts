import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'

export function listCommission(query: any): Promise<TableDataInfo<any[]>> {
  return request({ url: '/finance/commission/list', method: 'get', params: query })
}

export function addCommission(data: any): Promise<AjaxResult<number>> {
  return request({ url: '/finance/commission/batch', method: 'post', data })
}

export function confirmCommission(id: number): Promise<AjaxResult> {
  return request({ url: '/finance/commission/' + id + '/confirm', method: 'post' })
}

export function markPaidCommission(id: number, receiptOrPaymentId: number): Promise<AjaxResult> {
  return request({ url: '/finance/commission/' + id + '/paid/' + receiptOrPaymentId, method: 'post' })
}

export function cancelCommission(id: number): Promise<AjaxResult> {
  return request({ url: '/finance/commission/' + id + '/cancel', method: 'post' })
}
