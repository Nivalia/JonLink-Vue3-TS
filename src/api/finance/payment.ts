import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, PaymentQuejlParams, FinPayment } from '@/types'

// 查询付款单列表
export function listPayment(query: PaymentQuejlParams): Promise<TableDataInfo<FinPayment[]>> {
  return request({
    url: '/finance/payment/list',
    method: 'get',
    params: query
  })
}

// 查询付款单详细
export function getPayment(id: number): Promise<AjaxResult<FinPayment>> {
  return request({
    url: '/finance/payment/' + id,
    method: 'get'
  })
}

// 新增付款单
export function addPayment(data: FinPayment): Promise<AjaxResult> {
  return request({
    url: '/finance/payment',
    method: 'post',
    data: data
  })
}

// 修改付款单
export function updatePayment(data: FinPayment): Promise<AjaxResult> {
  return request({
    url: '/finance/payment',
    method: 'put',
    data: data
  })
}

// 删除付款单
export function delPayment(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/finance/payment/' + id,
    method: 'delete'
  })
}


