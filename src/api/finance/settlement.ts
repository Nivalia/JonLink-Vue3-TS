import request from '@/utils/request'
import type { FinPartner, FinReceivable, FinPayable } from '@/types'

export function listPartner(q?: any) { return request({ url: '/finance/partner/list', method: 'get', params: q || {} }) }
export function addPartner(p: FinPartner) { return request({ url: '/finance/partner', method: 'post', data: p }) }
export function delPartner(id: number | number[]) { return request({ url: '/finance/partner/' + id, method: 'delete' }) }
export function upsertPartner(p: { partnerName: string; partnerType?: string; refTable?: string; refId?: number }) {
  return request({ url: '/finance/partner/upsert', method: 'post', data: p })
}

export function listReceivable(q?: any) { return request({ url: '/finance/partner/receivable/list', method: 'get', params: q || {} }) }
export function addReceivable(body: { partnerId: number; bizType?: string; sourceType?: string; sourceId?: number; amount: number }) {
  return request({ url: '/finance/partner/receivable', method: 'post', data: body })
}
export function cancelReceivable(id: number, amount: number) {
  return request({ url: `/finance/partner/receivable/${id}/cancel`, method: 'post', data: { amount } })
}

export function listPayable(q?: any) { return request({ url: '/finance/partner/payable/list', method: 'get', params: q || {} }) }
export function addPayable(body: { partnerId: number; bizType?: string; sourceType?: string; sourceId?: number; amount: number }) {
  return request({ url: '/finance/partner/payable', method: 'post', data: body })
}
export function cancelPayable(id: number, amount: number) {
  return request({ url: `/finance/partner/payable/${id}/cancel`, method: 'post', data: { amount } })
}