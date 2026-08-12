import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, OrderQuejlParams, WxBizOrder } from '@/types'

// 查询核销管理列表
export function listOrder(query: OrderQuejlParams): Promise<TableDataInfo<WxBizOrder[]>> {
  return request({
    url: '/wx/order/list',
    method: 'get',
    params: query
  })
}

// 查询核销管理详细
export function getOrder(id: number): Promise<AjaxResult<WxBizOrder>> {
  return request({
    url: '/wx/order/' + id,
    method: 'get'
  })
}

// 新增核销管理
export function addOrder(data: WxBizOrder): Promise<AjaxResult> {
  return request({
    url: '/wx/order',
    method: 'post',
    data: data
  })
}

// 修改核销管理
export function updateOrder(data: WxBizOrder): Promise<AjaxResult> {
  return request({
    url: '/wx/order',
    method: 'put',
    data: data
  })
}

// 删除核销管理
export function delOrder(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/wx/order/' + id,
    method: 'delete'
  })
}

// 订单核销 (R5 三要素幂等: orderNo + phone/carNo/amount)
export function verifyOrder(data: { orderNo: string; phone?: string; carNo?: string; amount?: number }): Promise<AjaxResult> {
  return request({
    url: '/wx/mp/verify',
    method: 'post',
    data: data
  })
}


